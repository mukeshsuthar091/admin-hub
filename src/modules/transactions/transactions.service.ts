import { Injectable } from '@nestjs/common';
import { TransactionsRepository } from './repositories/transactions.repository';
import { Transaction } from './entities/transactions.entity';

@Injectable()
export class TransactionsService {
  constructor(private readonly repository: TransactionsRepository) {}

  findRecentTransactions(userId: string): Promise<Transaction[]> {
    return this.repository.findRecentTransactions(userId);
  }
}
