import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus, TransactionStatus } from '../../../common/enums';

export class BookingPaymentDto {
  @ApiProperty({ example: '9.99' })
  billingAmount: string;
  @ApiProperty({ nullable: true, type: String })
  currency: string | null;
  @ApiProperty({ enum: TransactionStatus })
  status: TransactionStatus;
  @ApiProperty({ nullable: true, type: String })
  invoiceCode: string | null;
  @ApiProperty({ nullable: true, type: String })
  invoiceUrl: string | null;
}

export class BookingCustomerDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  userCode: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  email: string;
  @ApiProperty({ nullable: true, type: String })
  avatarUrl: string | null;
  @ApiProperty()
  totalBookingsCompleted: number;
}

export class BookingDetailsDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  bookingCode: string;
  @ApiProperty({ enum: BookingStatus })
  status: BookingStatus;
  @ApiProperty()
  scheduledAt: Date;
  @ApiProperty()
  serviceType: string;
  @ApiProperty()
  durationMinutes: number;
  @ApiProperty({ nullable: true, type: String })
  location: string | null;
  @ApiProperty({ nullable: true, type: String })
  specialNotes: string | null;
  @ApiProperty({ type: BookingPaymentDto, nullable: true })
  payment: BookingPaymentDto | null;
  @ApiProperty({ type: BookingCustomerDto })
  customer: BookingCustomerDto;
}

export class BookingDetailsResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;
  @ApiProperty({ example: 'Booking details fetched successfully' })
  message: string;
  @ApiProperty({ type: BookingDetailsDto })
  data: BookingDetailsDto;
}
