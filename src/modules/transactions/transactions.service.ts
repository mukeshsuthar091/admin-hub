import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TransactionsRepository } from './repositories/transactions.repository';
import { Transaction } from './entities/transactions.entity';

import { DataSource, EntityManager } from 'typeorm';

import { ListTransactionsQueryDto } from './dto/list-transactions-query.dto';
import {
  TransactionDetailsDto,
  TransactionListItemDto,
  TransactionStatsDto,
} from './dto/transaction-response.dto';
import { PaginatedData } from '../../common/types';
import {
  calculatePagination,
  generatePaginationMeta,
} from '../../helpers/pagination.helper';

import { TransactionStatus, TransactionType } from '../../common/enums';
import {
  RefundTransactionDto,
  RefundResultDto,
} from './dto/refund-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly repository: TransactionsRepository,
    private readonly dataSource: DataSource,
  ) {}

  async refundTransaction(
    id: string,
    dto: RefundTransactionDto,
  ): Promise<RefundResultDto> {
    return this.dataSource.transaction(async (manager) => {
      const original = await this.repository.findForRefund(manager, id);
      if (!original) throw new NotFoundException('Transaction not found');
      
      if (
        original.status === TransactionStatus.REFUNDED ||
        (await this.repository.hasRefund(manager, id))
      ) {
        throw new ConflictException(
          'Transaction has already been fully refunded',
        );
      }
      
      if (
        original.transactionType !== TransactionType.PAYMENT ||
        original.status !== TransactionStatus.COMPLETED ||
        Number(original.totalAmount) <= 0
      ) {
        throw new BadRequestException(
          'Only completed payments with a positive amount can be refunded',
        );
      }
      if (
        dto.amount !== undefined &&
        dto.amount.toFixed(2) !== Number(original.totalAmount).toFixed(2)
      ) {
        throw new BadRequestException(
          'Refund amount must equal the full original transaction amount',
        );
      }
      return this.repository.saveRefund(manager, original);
    });
  }

  getStats(): Promise<TransactionStatsDto> {
    return this.repository.getStats();
  }

  async getTransactions(
    query: ListTransactionsQueryDto,
  ): Promise<PaginatedData<TransactionListItemDto>> {
    const { page, limit, offset } = calculatePagination(
      query.page,
      query.limit,
    );

    const [transactions, total] = await this.repository.findTransactions(
      query,
      offset,
      limit,
    );

    const data = transactions.map((item): TransactionListItemDto => ({
      id: item.id,
      transactionCode: item.transactionCode,
      transactionType: item.transactionType,
      totalAmount: item.totalAmount,
      currency: item.currency,
      status: item.status,
      createdAt: item.createdAt,
      user: {
        id: item.user.id,
        name: item.user.name,
        avatarUrl: item.user.avatarUrl,
      },
    }));
    return { data, meta: generatePaginationMeta(page, limit, total) };
  }

  async getTransactionById(id: string): Promise<TransactionDetailsDto> {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException('Transaction not found');
    const recent = await this.repository.findRelatedTransactions(
      item.userId,
      id,
    );
    return {
      id: item.id,
      transactionCode: item.transactionCode,
      serviceName: item.booking?.serviceName ?? null,
      userId: item.userId,
      bookingId: item.bookingId,
      parentTransactionId: item.parentTransactionId,
      transactionType: item.transactionType,
      status: item.status,
      subtotal: item.subtotal,
      totalAmount: item.totalAmount,
      currency: item.currency,
      gatewayFee: item.gatewayFee,
      paymentGateway: item.paymentGateway,
      gatewayReference: item.gatewayReference,
      invoiceNumber: item.invoiceNumber,
      invoiceUrl: item.invoiceUrl,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      proceedAt: item.proceedAt,
      user: {
        id: item.user.id,
        userCode: item.user.userCode,
        name: item.user.name,
        email: item.user.email,
        avatarUrl: item.user.avatarUrl,
      },
      recentTransactions: recent.map((transaction) => ({
        id: transaction.id,
        transactionCode: transaction.transactionCode,
        transactionType: transaction.transactionType,
        totalAmount: transaction.totalAmount,
        currency: transaction.currency,
        status: transaction.status,
        paymentGateway: transaction.paymentGateway,
        createdAt: transaction.createdAt,
        proceedAt: transaction.proceedAt,
      })),
    };
  }

  createPendingPayment(
    manager: EntityManager,
    data: {
      bookingId: string;
      userId: string;
      amount: string;
    },
  ): Promise<void> {
    return this.repository.createPendingPayment(manager, data);
  }

  findBookingPayment(bookingId: string): Promise<Transaction | null> {
    return this.repository.findBookingPayment(bookingId);
  }

  findRecentTransactions(userId: string): Promise<Transaction[]> {
    return this.repository.findRecentTransactions(userId);
  }
}
