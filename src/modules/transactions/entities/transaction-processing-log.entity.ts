import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import type { Relation } from 'typeorm';
import { LogBaseEntity } from '../../../common/entities/log-base.entity';
import { Transaction } from '../../transactions/entities/transactions.entity';

@Entity('transaction_processing_logs')
@Index('IDX_transaction_processing_logs_recent', ['transactionId', 'createdAt'])
export class TransactionProcessingLog extends LogBaseEntity {
  @Column({ name: 'transaction_id', type: 'uuid' })
  transactionId: string;

  @Column({ name: 'status', type: 'varchar', length: 50 })
  status: string;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @ManyToOne(() => Transaction, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'transaction_id',
    foreignKeyConstraintName: 'FK_transaction_processing_logs_transaction_id',
  })
  transaction: Relation<Transaction>;
}
