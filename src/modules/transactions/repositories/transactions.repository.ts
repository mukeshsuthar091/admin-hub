import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { TransactionStatus, TransactionType } from '../../../common/enums';
import { Transaction } from '../entities/transactions.entity';

import { generateCode } from '../../../helpers/code.helper';

@Injectable()
export class TransactionsRepository {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

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
