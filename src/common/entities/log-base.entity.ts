import { CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

// Logs are append-only and have no updatedAt column.
export abstract class LogBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
