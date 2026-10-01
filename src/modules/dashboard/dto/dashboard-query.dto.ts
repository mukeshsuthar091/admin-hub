import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { DashboardRange } from '../type/dashboard.enum';

export class DashboardQueryDto {
  @ApiPropertyOptional({
    enum: DashboardRange,
    default: DashboardRange.SIX_MONTHS,
  })
  @IsEnum(DashboardRange)
  range: DashboardRange = DashboardRange.SIX_MONTHS;
}
