import { Injectable } from '@nestjs/common';
import { Role } from './entities/role.entity';
import { RolesRepository } from './repositories/roles.repository';

@Injectable()
export class RolesService {
  constructor(private readonly repository: RolesRepository) {}

  findByName(name: string): Promise<Role | null> {
    return this.repository.findByName(name);
  }
}
