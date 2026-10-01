import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemAlert } from './entities/system-alert.entity';
import { Module } from '@nestjs/common';
import { AuthGuard } from '../../common/guards';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from './repositories/dashboard.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SystemAlert])],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardRepository, AuthGuard],
})
export class DashboardModule {}
