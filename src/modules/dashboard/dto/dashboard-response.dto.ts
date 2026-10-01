import { ApiProperty } from '@nestjs/swagger';
import { DashboardInterval, DashboardRange } from '../type/dashboard.enum';

export class DashboardCardDto {
  @ApiProperty()
  value: number;
  @ApiProperty()
  changePercent: number;
}

export class DashboardStatsDto {
  @ApiProperty({ type: DashboardCardDto })
  totalUsers: DashboardCardDto;
  @ApiProperty({ type: DashboardCardDto })
  totalRevenue: DashboardCardDto;
  @ApiProperty({ type: DashboardCardDto })
  activeBookings: DashboardCardDto;
  @ApiProperty({ type: DashboardCardDto })
  pendingTransactions: DashboardCardDto;
}

export class DashboardSeriesDto {
  @ApiProperty()
  label: string;
  @ApiProperty({ example: '2026-05-01' })
  date: string;
  @ApiProperty()
  revenue: number;
}

export class DashboardChartsDto {
  @ApiProperty({ enum: DashboardRange })
  range: DashboardRange;
  @ApiProperty()
  from: string;
  @ApiProperty()
  to: string;
  @ApiProperty({ enum: DashboardInterval })
  interval: DashboardInterval;
  @ApiProperty({ type: [DashboardSeriesDto] })
  series: DashboardSeriesDto[];
}

export class DashboardStatsResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;
  @ApiProperty({ example: 'Success' })
  message: string;
  @ApiProperty({ type: DashboardStatsDto })
  data: DashboardStatsDto;
}

export class DashboardChartsResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;
  @ApiProperty({ example: 'Success' })
  message: string;
  @ApiProperty({ type: DashboardChartsDto })
  data: DashboardChartsDto;
}
