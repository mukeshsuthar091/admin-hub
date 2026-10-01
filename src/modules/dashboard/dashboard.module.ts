import { Module } from '@nestjs/common';
import { AuthGuard } from '../../common/guards';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from './repositories/dashboard.repository';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, DashboardRepository, AuthGuard],
})
export class DashboardModule {}
