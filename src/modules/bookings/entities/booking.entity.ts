import type { Relation } from 'typeorm';
import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/base.entity';
import { BookingStatus } from '../../../common/enums';
import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../transactions/entities/transactions.entity';

@Entity('bookings')
@Index('IDX_bookings_status_schedule_at', ['status', 'scheduleAt'])
@Check('CHK_bookings_duration', '"duration_minutes" > 0')
@Check('CHK_bookings_amount', '"amount" >= 0')
export class Booking extends CustomBaseEntity {
  @Column({ name: 'booking_code', type: 'varchar', length: 50, unique: true })
  bookingCode: string;

  @Index('IDX_bookings_user_id')
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.bookings, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Column({ name: 'service_name', type: 'varchar', length: 150 })
  serviceName: string;

  @Index('IDX_bookings_schedule_at')
  @Column({ name: 'schedule_at', type: 'timestamptz' })
  scheduleAt: Date;

  @Column({ name: 'duration_minutes', type: 'integer' })
  durationMinutes: number;

  @Column({ type: 'text', nullable: true })
  location: string | null;

  @Column({ name: 'special_notes', type: 'text', nullable: true })
  specialNotes: string | null;

  // PostgreSQL numeric values are returned as strings to preserve precision.
  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: string;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    enumName: 'booking_status_enum',
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ name: 'is_delete', type: 'boolean', default: false })
  isDelete: boolean;

  @OneToMany(() => Transaction, (transaction) => transaction.booking)
  transactions: Relation<Transaction[]>;
}
