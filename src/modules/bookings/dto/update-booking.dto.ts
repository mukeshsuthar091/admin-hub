import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsISO8601, Matches, ValidateIf } from 'class-validator';

export class UpdateBookingDto {
  @ApiPropertyOptional()
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsBoolean()
  reschedule?: boolean;

  @ApiPropertyOptional()
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsBoolean()
  cancel_booking?: boolean;

  @ApiPropertyOptional({
    description: 'Required when reschedule is true',
    example: '2026-11-12T20:30:00+05:30',
  })
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsISO8601({ strict: true })
  @Matches(/T.*(?:Z|[+-]\d{2}:\d{2})$/)
  schedule_at?: string;
}
