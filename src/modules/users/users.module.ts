import { UserActivityLog } from './entities/user-activity-log.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsModule } from '../transactions/transactions.module';
import { BookingsModule } from '../bookings/bookings.module';
import { RolesModule } from '../roles/roles.module';
import { UserManagementGuard } from '../../common/guards/user-management.guard';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './repositories/users.repository';
import { AuthGuard } from '../../common/guards';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserActivityLog]),
    TransactionsModule,
    BookingsModule,
    RolesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, AuthGuard, UserManagementGuard],
})
export class UsersModule {}
