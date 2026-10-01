import { Column, Entity, Index } from 'typeorm';
import { LogBaseEntity } from '../../../common/entities/log-base.entity';

@Entity('system_alerts')
@Index('IDX_system_alerts_recent', ['isRead', 'createdAt'])
export class SystemAlert extends LogBaseEntity {
  @Column({ name: 'type', type: 'varchar', length: 30 })
  type: string;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'severity', type: 'varchar', length: 20 })
  severity: string;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;
}
