import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import type { Relation } from 'typeorm';
import { LogBaseEntity } from '../../../common/entities/log-base.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { User } from '../../users/entities/user.entity';

@Entity('booking_lifecycle_logs')
@Index('IDX_booking_lifecycle_logs_recent', ['bookingId', 'createdAt'])
export class BookingLifecycleLog extends LogBaseEntity {
  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @Column({ name: 'event_type', type: 'varchar', length: 50 })
  eventType: string;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'performed_by', type: 'uuid', nullable: true })
  performedBy: string | null;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @ManyToOne(() => Booking, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'booking_id',
    foreignKeyConstraintName: 'FK_booking_lifecycle_logs_booking_id',
  })
  booking: Relation<Booking>;

  @ManyToOne(() => User, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'performed_by',
    foreignKeyConstraintName: 'FK_booking_lifecycle_logs_performed_by',
  })
  performer: Relation<User> | null;
}
