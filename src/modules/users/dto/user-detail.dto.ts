import { ApiProperty } from '@nestjs/swagger';
import { UserProfileDto } from '../../auth/dto/user-profile.dto';
import { BookingStatus, TransactionStatus } from '../../../common/enums';

export class RecentTransactionDto {
  @ApiProperty({ format: 'uuid' })
  id: string;
  @ApiProperty()
  transactionCode: string;
  @ApiProperty({ example: '1500.00' })
  totalAmount: string;
  @ApiProperty({ example: 'INR', nullable: true, type: String })
  currency: string | null;
  @ApiProperty({ enum: TransactionStatus })
  status: TransactionStatus;
  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;
}

export class RecentBookingDto {
  @ApiProperty({ format: 'uuid' })
  id: string;
  @ApiProperty()
  bookingCode: string;
  @ApiProperty()
  serviceName: string;
  @ApiProperty({ enum: BookingStatus })
  status: BookingStatus;
  @ApiProperty({ type: String, format: 'date-time' })
  scheduleAt: Date;
}

export class RecentActivityLogDto {
  @ApiProperty({ format: 'uuid' })
  id: string;
  @ApiProperty()
  action: string;
  @ApiProperty()
  title: string;
  @ApiProperty({ type: String, nullable: true })
  description: string | null;
  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;
}

export class UserDetailDto extends UserProfileDto {
  @ApiProperty({
    type: [RecentActivityLogDto],
    description: 'Latest user activity logs',
  })
  recentActivityLogs: RecentActivityLogDto[];
  @ApiProperty({ type: [RecentTransactionDto] })
  transactions: RecentTransactionDto[];
  @ApiProperty({ type: [RecentBookingDto] })
  booking: RecentBookingDto[];
}

export class UserDetailResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;
  @ApiProperty({ example: 'Success' })
  message: string;
  @ApiProperty({ type: UserDetailDto })
  data: UserDetailDto;
}

export class UserPersonalInfoDto {
  @ApiProperty()
  name: string;
  @ApiProperty({ type: String, nullable: true })
  phone_number: string | null;
  @ApiProperty({ type: String, nullable: true, format: 'date' })
  dob: string | null;
  @ApiProperty({ type: String, nullable: true })
  address: string | null;
  @ApiProperty()
  status: string;
}

export class UserPersonalInfoResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;
  @ApiProperty({ example: 'Success' })
  message: string;
  @ApiProperty({ type: UserPersonalInfoDto })
  data: UserPersonalInfoDto;
}
