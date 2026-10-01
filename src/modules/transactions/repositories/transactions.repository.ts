import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transactions.entity';

@Injectable()
export class TransactionsRepository {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

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
