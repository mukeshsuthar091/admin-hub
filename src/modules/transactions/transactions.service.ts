import { Injectable } from '@nestjs/common';
import { TransactionsRepository } from './repositories/transactions.repository';
import { Transaction } from './entities/transactions.entity';

import { EntityManager } from 'typeorm';

@Injectable()
export class TransactionsService {
  constructor(private readonly repository: TransactionsRepository) {}

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
