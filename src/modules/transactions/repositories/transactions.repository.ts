import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, EntityManager, Not, Repository } from 'typeorm';
import { TransactionStatus, TransactionType } from '../../../common/enums';
import { Transaction } from '../entities/transactions.entity';

import { generateCode } from '../../../helpers/code.helper';

import { ListTransactionsQueryDto } from '../dto/list-transactions-query.dto';
import { TransactionStatsDto } from '../dto/transaction-response.dto';

import {
  TransactionDateFilter,
  TransactionTypeFilter,
  TransactionAmountFilter,
} from '../type/transaction-query.enum';

@Injectable()
export class TransactionsRepository {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  findForRefund(
    manager: EntityManager,
    id: string,
  ): Promise<Transaction | null> {
    return manager.getRepository(Transaction).findOne({
      where: { id, isDelete: false },
      lock: { mode: 'pessimistic_write' },
    });
  }

  hasRefund(
    manager: EntityManager,
    parentTransactionId: string,
  ): Promise<boolean> {
    return manager
      .getRepository(Transaction)
      .exists({ where: { parentTransactionId } });
  }

  async saveRefund(
    manager: EntityManager,
    original: Transaction,
  ): Promise<{
    originalTransaction: Transaction;
    refundTransaction: Transaction;
  }> {
    const repository = manager.getRepository(Transaction);
    original.status = TransactionStatus.REFUNDED;
    const originalTransaction = await repository.save(original);

    const transactionCode = await generateCode(
      manager.connection,
      'transaction_code_seq',
      'TXN',
    );

    const refundTransaction = await repository.save(
      repository.create({
        transactionCode,
        parentTransactionId: original.id,
        userId: original.userId,
        bookingId: original.bookingId,
        transactionType: TransactionType.REFUND,
        status: TransactionStatus.COMPLETED,
        subtotal: `-${original.totalAmount}`,
        totalAmount: `-${original.totalAmount}`,
        currency: original.currency,
        gatewayFee: '0.00',
        paymentGateway: original.paymentGateway,
        proceedAt: new Date(),
      }),
    );
    return { originalTransaction, refundTransaction };
  }

  async getStats(): Promise<TransactionStatsDto> {
    const row = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('COUNT(*)', 'totalTransactions')
      .addSelect(
        'COALESCE(SUM(transaction.totalAmount), 0)::numeric(24,2)',
        'totalVolume',
      )
      .addSelect(
        'COALESCE(AVG(transaction.totalAmount), 0)::numeric(24,2)',
        'avgTransaction',
      )
      .addSelect(
        'COUNT(*) FILTER (WHERE transaction.status = :completed)',
        'successful',
      )
      .where('transaction.isDelete = :isDelete', { isDelete: false })
      .setParameter('completed', TransactionStatus.COMPLETED)
      .getRawOne<{
        totalTransactions: string;
        totalVolume: string;
        avgTransaction: string;
        successful: string;
      }>();
    const totalTransactions = Number(row?.totalTransactions ?? 0);
    return {
      totalTransactions,
      totalVolume: row?.totalVolume ?? '0.00',
      avgTransaction: row?.avgTransaction ?? '0.00',
      successRate: totalTransactions
        ? Number(
            ((Number(row?.successful ?? 0) / totalTransactions) * 100).toFixed(
              1,
            ),
          )
        : 0,
    };
  }

  findTransactions(
    filters: ListTransactionsQueryDto,
    offset: number,
    limit: number,
  ): Promise<[Transaction[], number]> {
    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .innerJoin('transaction.user', 'user')
      .select([
        'transaction.id',
        'transaction.transactionCode',
        'transaction.transactionType',
        'transaction.totalAmount',
        'transaction.currency',
        'transaction.status',
        'transaction.createdAt',
        'user.id',
        'user.name',
        'user.avatarUrl',
      ])
      .where('transaction.isDelete = :isDelete', { isDelete: false });
    if (filters.search) {
      const search = `%${filters.search.replace(/[\\%_]/g, '\\$&').replace(/^#/, '')}%`;
      query.andWhere(
        new Brackets((qb) => {
          qb.where('transaction.transactionCode ILIKE :search', { search })
            .orWhere('CAST(transaction.id AS text) ILIKE :search', { search })
            .orWhere('user.name ILIKE :search', { search });
        }),
      );
    }
    if (filters.date === TransactionDateFilter.LAST_30_DAYS) {
      query
        .andWhere(
          "transaction.createdAt >= CURRENT_TIMESTAMP - INTERVAL '30 days'",
        )
        .andWhere('transaction.createdAt <= CURRENT_TIMESTAMP');
    }
    if (filters.type && filters.type !== TransactionTypeFilter.ALL)
      query.andWhere('transaction.transactionType = :type', {
        type: filters.type,
      });
    if (filters.amount === TransactionAmountFilter.UNDER_1000)
      query.andWhere('ABS(transaction.totalAmount) < :maximum', {
        maximum: 1000,
      });
    if (filters.amount === TransactionAmountFilter.BETWEEN_1000_AND_10000)
      query.andWhere(
        'ABS(transaction.totalAmount) BETWEEN :minimum AND :maximum',
        {
          minimum: 1000,
          maximum: 10000,
        },
      );
    if (filters.amount === TransactionAmountFilter.OVER_10000)
      query.andWhere('ABS(transaction.totalAmount) > :minimum', {
        minimum: 10000,
      });
    return query
      .orderBy('transaction.createdAt', 'DESC')
      .addOrderBy('transaction.id', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();
  }

  findById(id: string): Promise<Transaction | null> {
    return this.transactionRepository.findOne({
      where: { id, isDelete: false },
      relations: { user: true, booking: true },
      select: {
        id: true,
        transactionCode: true,
        userId: true,
        bookingId: true,
        parentTransactionId: true,
        transactionType: true,
        status: true,
        subtotal: true,
        totalAmount: true,
        currency: true,
        paymentGateway: true,
        gatewayReference: true,
        gatewayFee: true,
        invoiceNumber: true,
        invoiceUrl: true,
        createdAt: true,
        updatedAt: true,
        proceedAt: true,
        booking: { serviceName: true },
        user: {
          id: true,
          userCode: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    });
  }

  findRelatedTransactions(
    userId: string,
    excludeId: string,
  ): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { userId, id: Not(excludeId), isDelete: false },
      select: {
        id: true,
        transactionCode: true,
        transactionType: true,
        totalAmount: true,
        currency: true,
        status: true,
        paymentGateway: true,
        createdAt: true,
        proceedAt: true,
      },
      order: { createdAt: 'DESC', id: 'DESC' },
      take: 2,
    });
  }

  async createPendingPayment(
    manager: EntityManager,
    data: {
      bookingId: string;
      userId: string;
      amount: string;
    },
  ): Promise<void> {
    const repository = manager.getRepository(Transaction);
    const transactionCode = await generateCode(
      manager.connection,
      'transaction_code_seq',
      'TXN',
    );
    await repository.save(
      repository.create({
        transactionCode,
        bookingId: data.bookingId,
        userId: data.userId,
        transactionType: TransactionType.PAYMENT,
        status: TransactionStatus.PENDING,
        subtotal: data.amount,
        totalAmount: data.amount,
        currency: null,
        gatewayFee: '0.00',
      }),
    );
  }

  findBookingPayment(bookingId: string): Promise<Transaction | null> {
    return this.transactionRepository.findOne({
      where: {
        bookingId,
        transactionType: TransactionType.PAYMENT,
        isDelete: false,
      },
      select: {
        totalAmount: true,
        currency: true,
        status: true,
        invoiceNumber: true,
        invoiceUrl: true,
      },
      order: { createdAt: 'DESC', id: 'DESC' },
    });
  }

  findRecentTransactions(userId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { userId, isDelete: false },
      select: {
        id: true,
        transactionCode: true,
        totalAmount: true,
        currency: true,
        status: true,
        createdAt: true,
      },
      order: { createdAt: 'DESC', id: 'DESC' },
      take: 2,
    });
  }
}
