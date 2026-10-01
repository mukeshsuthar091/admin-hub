import { ApiProperty } from '@nestjs/swagger';

export class BookingCountsDto {
  @ApiProperty()
  total: number;
  @ApiProperty()
  active: number;
  @ApiProperty()
  completed: number;
  @ApiProperty()
  cancelled: number;
}

export class BookingStatsDto extends BookingCountsDto {
  @ApiProperty({
    type: BookingCountsDto,
    description:
      'Percentage change of current-month versus previous-month creation counts',
  })
  comparison: BookingCountsDto;
}

export class BookingStatsResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;
  @ApiProperty({ example: 'Success' })
  message: string;
  @ApiProperty({ type: BookingStatsDto })
  data: BookingStatsDto;
}
