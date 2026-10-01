import { ApiProperty } from '@nestjs/swagger';
import type { PaginationMeta } from '../../../common/types';

export class SystemAlertDto {
  @ApiProperty({ format: 'uuid' })
  id: string;
  @ApiProperty({ example: 'CRITICAL' })
  severity: string;
  @ApiProperty()
  title: string;
  @ApiProperty({ type: String, nullable: true })
  description: string | null;
  @ApiProperty()
  isRead: boolean;
  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;
}

export class SystemAlertsResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;
  @ApiProperty({ example: 'Success' })
  message: string;
  @ApiProperty({ type: [SystemAlertDto] })
  data: SystemAlertDto[];
  @ApiProperty({ example: { page: 1, limit: 10, total: 3, totalPages: 1 } })
  meta: PaginationMeta;
}
