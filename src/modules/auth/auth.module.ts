import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { AppToken } from './entities/appToken.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './repositories/auth.repository';
import { AuthGuard } from '../../common/guards';

@Module({
  imports: [TypeOrmModule.forFeature([User, AppToken])],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, AuthGuard],
  exports: [AuthService],
})
export class AuthModule {}
