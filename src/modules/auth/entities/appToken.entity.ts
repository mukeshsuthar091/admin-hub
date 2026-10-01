import type { Relation } from 'typeorm';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('app_tokens')
@Index('IDX_app_tokens_user_id_is_expired', ['userId', 'isExpired'])
export class AppToken extends CustomBaseEntity {
    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @ManyToOne(() => User, (user) => user.appTokens, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_id' })
    user: Relation<User>;

    @Column({ name: 'access_token', type: 'text', select: false })
    accessToken: string;

    @Column({ name: 'refresh_token', type: 'text', select: false })
    refreshToken: string;

    @Column({ name: 'device_token', type: 'text', nullable: true, select: false })
    deviceToken: string | null;

    @Column({ name: 'ip_address', type: 'inet', nullable: true })
    ipAddress: string | null;

    @Column({ name: 'is_expired', type: 'boolean', default: false })
    isExpired: boolean;
}
