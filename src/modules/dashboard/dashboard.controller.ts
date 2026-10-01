import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import {
  DashboardChartsDto,
  DashboardChartsResponseDto,
  DashboardStatsDto,
  DashboardStatsResponseDto,
} from './dto/dashboard-response.dto';

import { PaginatedData } from '../../common/types';
import { ListAlertsQueryDto } from './dto/list-alerts-query.dto';
import {
  SystemAlertDto,
  SystemAlertsResponseDto,
} from './dto/system-alert.dto';

@ApiTags('Dashboard')
@ApiBearerAuth('JWT-auth')
@ApiUnauthorizedResponse({
  description: 'Missing/invalid access token or disabled account',
})
@UseGuards(AuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('alerts')
  @ApiOperation({ summary: 'Paginated system alerts, newest first' })
  @ApiOkResponse({ type: SystemAlertsResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid pagination values' })
  getAlerts(
    @Query() query: ListAlertsQueryDto,
  ): Promise<PaginatedData<SystemAlertDto>> {
    return this.dashboardService.getAlerts(query);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Dashboard totals and calendar-month percentage comparisons',
  })
  @ApiOkResponse({ type: DashboardStatsResponseDto })
  getStats(): Promise<DashboardStatsDto> {
    return this.dashboardService.getStats();
  }

  @Get('charts')
  @ApiOperation({
    summary:
      'Revenue overview with zero-filled daily, weekly or monthly periods',
  })
  @ApiOkResponse({ type: DashboardChartsResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid range' })
  getCharts(@Query() query: DashboardQueryDto): Promise<DashboardChartsDto> {
    return this.dashboardService.getCharts(query.range);
  }
}
