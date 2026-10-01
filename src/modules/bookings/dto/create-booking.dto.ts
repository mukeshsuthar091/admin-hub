import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsUUID,
  IsNumber,
  Min,
  Max,
  IsInt,
  IsISO8601,
  Matches,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  @MaxLength(150)
  service_name: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  user_id: string;

  @ApiProperty({ example: 120 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999999.99)
  amount: number;

  @ApiProperty({ example: 60, description: 'Duration in minutes' })
  @IsInt()
  @Min(1)
  @Max(2147483647)
  duration: number;

  @ApiProperty({ example: '2026-11-12T20:30:00+05:30' })
  @IsISO8601({ strict: true })
  @Matches(/T.*(?:Z|[+-]\d{2}:\d{2})$/)
  schedule_at: string;
}
