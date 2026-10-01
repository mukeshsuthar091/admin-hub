import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';

@Injectable()
export class RolesRepository {
  constructor(
    @InjectRepository(Role) private readonly repository: Repository<Role>,
  ) {}

  findByName(name: string): Promise<Role | null> {
    return this.repository.findOne({ where: { name, isDelete: false } });
  }
}
