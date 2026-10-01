import type { Relation } from 'typeorm';
import { Column, Entity, OneToMany } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('roles')
export class Role extends CustomBaseEntity {
  @Column({ name: 'role_code', type: 'varchar', length: 50, unique: true })
  roleCode: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_delete', type: 'boolean', default: false })
  isDelete: boolean;

  @OneToMany(() => User, (user) => user.role)
  users: Relation<User[]>;
}
