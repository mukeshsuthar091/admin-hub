import type { Relation } from 'typeorm';
import { Check, Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/base.entity';
import { TransactionStatus, TransactionType } from '../../../common/enums';
import { User } from '../../users/entities/user.entity';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('transactions')
@Index('IDX_transactions_status_created_at', ['status', 'createdAt'])
@Check(
  'CHK_transactions_amounts',
  '"subtotal" >= 0 AND "total_amount" >= 0 AND "gateway_fee" >= 0',
)
export class Transaction extends CustomBaseEntity {
  @Column({
    name: 'transaction_code',
    type: 'varchar',
    length: 50,
    unique: true,
  })
  transactionCode: string;

  @Index('IDX_transactions_user_id')
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.transactions, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Index('IDX_transactions_booking_id')
  @Column({ name: 'booking_id', type: 'uuid', nullable: true })
  bookingId: string | null;

  @ManyToOne(() => Booking, (booking) => booking.transactions, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'booking_id' })
  booking: Relation<Booking> | null;

  @Column({
    name: 'transaction_type',
    type: 'enum',
    enum: TransactionType,
    enumName: 'transaction_type_enum',
  })
  transactionType: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    enumName: 'transaction_status_enum',
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  subtotal: string;

  @Column({ name: 'total_amount', type: 'numeric', precision: 12, scale: 2 })
  totalAmount: string;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({
    name: 'payment_gateway',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  paymentGateway: string | null;

  @Column({
    name: 'gateway_reference',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  gatewayReference: string | null;

  @Column({
    name: 'gateway_fee',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
  })
  gatewayFee: string;

  @Column({
    name: 'invoice_number',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  invoiceNumber: string | null;

  @Column({ name: 'invoice_url', type: 'text', nullable: true })
  invoiceUrl: string | null;

  @Column({ name: 'is_delete', type: 'boolean', default: false })
  isDelete: boolean;

  @Column({ name: 'proceed_at', type: 'timestamptz', nullable: true })
  proceedAt: Date | null;
}
