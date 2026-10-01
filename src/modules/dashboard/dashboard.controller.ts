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

@ApiTags('Dashboard')
@ApiBearerAuth('JWT-auth')
@ApiUnauthorizedResponse({
  description: 'Missing/invalid access token or disabled account',
})
@UseGuards(AuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

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
