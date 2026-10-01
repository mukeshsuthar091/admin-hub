import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '../../../common/enums';

export class BookingCustomerDto {
  @ApiProperty({ format: 'uuid' })
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty({ type: String, nullable: true })
  avatarUrl: string | null;
}

export class BookingListItemDto {
  @ApiProperty({ format: 'uuid' })
  id: string;
  @ApiProperty()
  bookingCode: string;
  @ApiProperty({ type: BookingCustomerDto })
  user: BookingCustomerDto;
  @ApiProperty()
  serviceName: string;
  @ApiProperty({ type: String, format: 'date-time' })
  scheduleAt: Date;
  @ApiProperty({ description: 'Duration in minutes' })
  durationMinutes: number;
  @ApiProperty({ enum: BookingStatus })
  status: BookingStatus;
  @ApiProperty({
    example: '1500.00',
    description: 'Decimal amount as a string',
  })
  amount: string;
}

export class BookingListMetaDto {
  @ApiProperty()
  page: number;
  @ApiProperty()
  limit: number;
  @ApiProperty()
  total: number;
  @ApiProperty()
  totalPages: number;
}

export class BookingListResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;
  @ApiProperty({ example: 'Success' })
  message: string;
  @ApiProperty({ type: [BookingListItemDto] })
  data: BookingListItemDto[];
  @ApiProperty({ type: BookingListMetaDto })
  meta: BookingListMetaDto;
}
