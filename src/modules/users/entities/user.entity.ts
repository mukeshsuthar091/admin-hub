import type { Relation } from 'typeorm';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/base.entity';
import { UserStatus } from '../../../common/enums';
import { Role } from '../../roles/entities/role.entity';
import { AppToken } from '../../auth/entities/appToken.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Transaction } from '../../transactions/entities/transactions.entity';

@Entity('users')
@Index('IDX_users_status_is_delete', ['status', 'isDelete'])
export class User extends CustomBaseEntity {
  @Index('IDX_users_role_id')
  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string;

  @ManyToOne(() => Role, (role) => role.users, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'role_id' })
  role: Relation<Role>;

  @Column({ name: 'user_code', type: 'varchar', length: 50, unique: true })
  userCode: string;

  @Index('IDX_users_name')
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 254, unique: true })
  email: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 30, nullable: true })
  phoneNumber: string | null;

  @Column({ type: 'date', nullable: true })
  dob: string | null;

  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string | null;

  @Column({
    type: 'enum',
    enum: UserStatus,
    enumName: 'user_status_enum',
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ name: 'is_delete', type: 'boolean', default: false })
  isDelete: boolean;

  @Column({ name: 'last_active_at', type: 'timestamptz', nullable: true })
  lastActiveAt: Date | null;

  @OneToMany(() => AppToken, (token) => token.user)
  appTokens: Relation<AppToken[]>;

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Relation<Booking[]>;

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Relation<Transaction[]>;
}
