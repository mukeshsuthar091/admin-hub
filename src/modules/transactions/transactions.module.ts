import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transactions.entity';
import { TransactionsRepository } from './repositories/transactions.repository';
import { TransactionsService } from './transactions.service';

import { TransactionsController } from './transactions.controller';
import { AuthGuard } from '../../common/guards';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  controllers: [TransactionsController],
  providers: [TransactionsRepository, TransactionsService, AuthGuard],
  exports: [TransactionsService],
})
export class TransactionsModule {}
