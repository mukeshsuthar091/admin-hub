import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, In, Repository } from 'typeorm';
import { ListUsersQueryDto } from '../dto/list-users-query.dto';
import { Role } from '../../roles/entities/role.entity';
import { generateCode } from '../../../helpers/code.helper';
import { AppToken } from '../../auth/entities/appToken.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { UserStatus } from '../../../common/enums';
import { UserStatsDto } from '../dto/user-stats.dto';

interface UserStatsRow {
  totalUsers: string;
  activeUsers: string;
  newThisMonth: string;
}

import {
  UserRoleFilter,
  UserStatusFilter,
  UserSortBy,
  UserSortOrder,
} from '../type/user-query.enum';

import { UserActivityLog } from '../entities/user-activity-log.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email, isDelete: false },
      select: { id: true },
    });
  }

  async createUser(data: {
    name: string;
    email: string;
    roleId: string;
    password: string;
  }): Promise<User> {
    const userCode = await generateCode(
      this.dataSource,
      'user_code_seq',
      'USR',
    );
    return this.userRepository.save(
      this.userRepository.create({
        ...data,
        userCode,
        status: UserStatus.ACTIVE,
        isDelete: false,
      }),
    );
  }

  async bulkUpdate(
    ids: string[],
    roleId: string | undefined,
    suspend: boolean,
  ): Promise<boolean> {
    return this.dataSource.transaction(async (manager) => {
      if (roleId) {
        const role = await manager.getRepository(Role).findOne({
          where: { id: roleId, isDelete: false },
          lock: { mode: 'pessimistic_read' },
        });
        if (!role) return false;
      }
      const repository = manager.getRepository(User);
      const users = await repository
        .createQueryBuilder('user')
        .select('user.id')
        .where('user.id IN (:...ids)', { ids })
        .andWhere('user.isDelete = :isDelete', { isDelete: false })
        .orderBy('user.id', 'ASC')
        .setLock('pessimistic_write')
        .getMany();
      if (users.length !== ids.length) return false;

      const changes: Partial<User> = {};
      if (roleId) changes.roleId = roleId;
      if (suspend) changes.status = UserStatus.SUSPENDED;
      await repository.update({ id: In(ids), isDelete: false }, changes);
      await manager
        .getRepository(AppToken)
        .update({ userId: In(ids), isExpired: false }, { isExpired: true });
      return true;
    });
  }

  isUserExist(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id, isDelete: false },
      select: { id: true },
    });
  }

  findRecentActivityLogs(userId: string): Promise<UserActivityLog[]> {
    return this.dataSource.getRepository(UserActivityLog).find({
      where: { userId },
      select: {
        id: true,
        action: true,
        title: true,
        description: true,
        createdAt: true,
      },
      order: { createdAt: 'DESC', id: 'DESC' },
      take: 5,
    });
  }

  findUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id, isDelete: false },
      relations: { role: true },
    });
  }

  async updatePersonalInfo(
    id: string,
    dto: UpdateUserDto,
  ): Promise<User | null> {
    return this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(User);

      const changes: Partial<User> = {};

      if (dto.name !== undefined) changes.name = dto.name;
      if (dto.phone_number !== undefined)
        changes.phoneNumber = dto.phone_number;
      if (dto.dob !== undefined) changes.dob = dto.dob;
      if (dto.address !== undefined) changes.address = dto.address;
      if (dto.status !== undefined) changes.status = UserStatus.SUSPENDED;

      const result = await repository.update({ id, isDelete: false }, changes);
      if (result.affected !== 1) return null;
      if (dto.status === 'suspended') {
        await manager
          .getRepository(AppToken)
          .update({ userId: id, isExpired: false }, { isExpired: true });
      }
      return repository.findOne({ where: { id, isDelete: false } });
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const result = await manager
        .getRepository(User)
        .update({ id, isDelete: false }, { isDelete: true });
      if (result.affected !== 1) throw new NotFoundException('User not found');
      await manager
        .getRepository(AppToken)
        .update({ userId: id, isExpired: false }, { isExpired: true });
    });
  }

  async findUsers(
    filters: ListUsersQueryDto,
    offset: number,
    limit: number,
  ): Promise<[User[], number]> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.role', 'role')
      .select([
        'user.id',
        'user.userCode',
        'user.name',
        'user.email',
        'user.avatarUrl',
        'user.status',
        'user.createdAt',
        'user.lastActiveAt',
        'role.id',
        'role.name',
      ])
      .where('user.isDelete = :isDelete', { isDelete: false });

    if (filters.search) {
      const search = `%${filters.search.replace(/[\\%_]/g, '\\$&')}%`;
      query.andWhere(
        new Brackets((qb) => {
          qb.where('user.name ILIKE :search', { search }).orWhere(
            'user.email ILIKE :search',
            { search },
          );
        }),
      );
    }

    if (filters.role && filters.role !== UserRoleFilter.ALL) {
      query.andWhere('role.name = :role', { role: filters.role });
    }

    if (filters.status && filters.status !== UserStatusFilter.ALL) {
      query.andWhere('user.status = :status', { status: filters.status });
    }

    const sortColumn =
      filters.sortBy === UserSortBy.NAME ? 'user.name' : 'user.createdAt';
    const sortOrder =
      filters.sortOrder ??
      (filters.sortBy === UserSortBy.NAME
        ? UserSortOrder.ASC
        : UserSortOrder.DESC);

    return query
      .orderBy(sortColumn, sortOrder)
      .addOrderBy('user.id', 'ASC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();
  }

  async getStats(): Promise<UserStatsDto> {
    // Calculate calendar boundaries in the application timezone, not the DB timezone.
    const localMonthStart =
      "DATE_TRUNC('month', CURRENT_TIMESTAMP AT TIME ZONE :timezone)";
    const monthStart = `(${localMonthStart} AT TIME ZONE :timezone)`;
    const nextMonthStart = `((${localMonthStart} + INTERVAL '1 month') AT TIME ZONE :timezone)`;

    const result = await this.userRepository
      .createQueryBuilder('user')
      .select('COUNT(*)', 'totalUsers')
      .addSelect(
        'COUNT(*) FILTER (WHERE user.status = :activeStatus)',
        'activeUsers',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE user.createdAt >= ${monthStart} AND user.createdAt < ${nextMonthStart})`,
        'newThisMonth',
      )
      .where('user.isDelete = :isDelete', { isDelete: false })
      .setParameters({
        activeStatus: UserStatus.ACTIVE,
        timezone: process.env.APP_TIMEZONE ?? 'UTC',
      })
      .getRawOne<UserStatsRow>();

    return {
      totalUsers: Number(result?.totalUsers ?? 0),
      activeUsers: Number(result?.activeUsers ?? 0),
      newThisMonth: Number(result?.newThisMonth ?? 0),
    };
  }
}
