import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { RolesService } from '../roles/roles.service';
import { hashPassword } from '../../helpers/password.helper';
import { CreateUserDto } from './dto/create-user.dto';
import { BulkUpdateUsersDto } from './dto/bulk-update-users.dto';
import { CreatedUserDto } from './dto/create-user-response.dto';
import { TransactionsService } from '../transactions/transactions.service';
import { BookingsService } from '../bookings/bookings.service';
import { UsersRepository } from './repositories/users.repository';
import {
  calculatePagination,
  generatePaginationMeta,
} from '../../helpers/pagination.helper';
import { PaginatedData } from '../../common/types';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UserListItemDto } from './dto/user-list.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDetailDto, UserPersonalInfoDto } from './dto/user-detail.dto';
import { UserStatsDto } from './dto/user-stats.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly transactionsService: TransactionsService,
    private readonly bookingsService: BookingsService,
    private readonly rolesService: RolesService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<CreatedUserDto> {
    if (await this.usersRepository.findByEmail(dto.email)) {
      throw new ConflictException('User with this email already exists');
    }

    const role = await this.rolesService.findByName(dto.role);
    if (!role) throw new NotFoundException('Role not found or deleted');

    const password = await hashPassword('User@123');
    try {
      const user = await this.usersRepository.createUser({
        name: dto.name,
        email: dto.email,
        roleId: role.id,
        password,
      });
      return {
        id: user.id,
        code: user.userCode,
        role: role.name,
        name: user.name,
        email: user.email,
        created: user.createdAt,
      };
    } catch (error: unknown) {
      if (error instanceof QueryFailedError) {
        const details = error.driverError as { code?: string; detail?: string };
        if (details.code === '23505' && details.detail?.includes('(email)')) {
          throw new ConflictException('User with this email already exists');
        }
      }
      throw error;
    }
  }

  async bulkUpdateUsers(dto: BulkUpdateUsersDto): Promise<void> {
    if (!dto.role && dto.is_suspend !== true) {
      throw new BadRequestException('Provide a role or set is_suspend to true');
    }
    const role = dto.role ? await this.rolesService.findByName(dto.role) : null;
    if (dto.role && !role)
      throw new NotFoundException('Role not found or deleted');

    const updated = await this.usersRepository.bulkUpdate(
      dto.user_ids,
      role?.id,
      dto.is_suspend === true,
    );
    if (!updated)
      throw new NotFoundException(
        'One or more selected users or the role no longer exist',
      );
  }

  async getUserById(id: string): Promise<UserDetailDto> {
    const user = await this.usersRepository.findUserById(id);

    if (!user) throw new NotFoundException('User not found');

    const [transactions, booking, activityLogs] = await Promise.all([
      this.transactionsService.findRecentTransactions(id),
      this.bookingsService.findRecentBookings(id),
      this.usersRepository.findRecentActivityLogs(id),
    ]);

    return {
      id: user.id,
      userCode: user.userCode,
      name: user.name,
      email: user.email,
      role: user.role?.name ?? '',
      phoneNumber: user.phoneNumber,
      dob: user.dob,
      avatarUrl: user.avatarUrl,
      address: user.address,
      city: user.city,
      state: user.state,
      country: user.country,
      status: user.status,
      isDelete: user.isDelete,
      lastActiveAt: user.lastActiveAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      recentActivityLogs: activityLogs.map((log) => ({
        id: log.id,
        action: log.action,
        title: log.title,
        description: log.description,
        createdAt: log.createdAt,
      })),
      transactions: transactions.map((item) => ({
        id: item.id,
        transactionCode: item.transactionCode,
        totalAmount: item.totalAmount,
        currency: item.currency,
        status: item.status,
        createdAt: item.createdAt,
      })),
      booking: booking.map((item) => ({
        id: item.id,
        bookingCode: item.bookingCode,
        serviceName: item.serviceName,
        status: item.status,
        scheduleAt: item.scheduleAt,
      })),
    };
  }

  async updateUser(
    id: string,
    dto: UpdateUserDto,
  ): Promise<UserPersonalInfoDto> {
    if (!Object.values(dto).some((value) => value !== undefined)) {
      throw new BadRequestException(
        'Provide at least one personal information field',
      );
    }
    if (dto.dob && dto.dob > new Date().toISOString().slice(0, 10)) {
      throw new BadRequestException('Date of birth cannot be in the future');
    }
    const existingUser = await this.usersRepository.isUserExist(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const user = await this.usersRepository.updatePersonalInfo(id, dto);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      name: user.name,
      phone_number: user.phoneNumber,
      dob: user.dob,
      address: user.address,
      status: user.status,
    };
  }

  deleteUser(id: string): Promise<void> {
    return this.usersRepository.softDelete(id);
  }

  async getUsers(
    query: ListUsersQueryDto,
  ): Promise<PaginatedData<UserListItemDto>> {
    const { page, limit, offset } = calculatePagination(
      query.page,
      query.limit,
    );
    const [users, total] = await this.usersRepository.findUsers(
      query,
      offset,
      limit,
    );
    const data = users.map((user): UserListItemDto => ({
      id: user.id,
      userCode: user.userCode,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role?.name ?? null,
      status: user.status,
      createdAt: user.createdAt,
      lastActiveAt: user.lastActiveAt,
    }));
    return { data, meta: generatePaginationMeta(page, limit, total) };
  }

  getStats(): Promise<UserStatsDto> {
    return this.usersRepository.getStats();
  }
}
