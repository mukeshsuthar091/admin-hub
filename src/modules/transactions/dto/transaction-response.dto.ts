import type { PaginationMeta } from '../../../common/types';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionStatus, TransactionType } from '../../../common/enums';

export class TransactionStatsDto {
  @ApiProperty()
  totalTransactions: number;
  @ApiProperty({ example: '1114706.00' })
  totalVolume: string;
  @ApiProperty({ example: '22294.12' })
  avgTransaction: string;
  @ApiProperty()
  successRate: number;
}

export class TransactionCustomerDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  userCode: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  email: string;
  @ApiProperty({ type: String, nullable: true })
  avatarUrl: string | null;
}

export class TransactionListUserDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty({ type: String, nullable: true })
  avatarUrl: string | null;
}

export class TransactionListItemDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  transactionCode: string;
  @ApiProperty({ enum: TransactionType })
  transactionType: TransactionType;
  @ApiProperty()
  totalAmount: string;
  @ApiProperty({ type: String, nullable: true })
  currency: string | null;
  @ApiProperty({ enum: TransactionStatus })
  status: TransactionStatus;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty({ type: TransactionListUserDto })
  user: TransactionListUserDto;
}

export class RelatedTransactionDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  transactionCode: string;
  @ApiProperty({ enum: TransactionType })
  transactionType: TransactionType;
  @ApiProperty()
  totalAmount: string;
  @ApiProperty({ type: String, nullable: true })
  currency: string | null;
  @ApiProperty({ enum: TransactionStatus })
  status: TransactionStatus;
  @ApiProperty({ type: String, nullable: true })
  paymentGateway: string | null;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  proceedAt: Date | null;
}

export class ProcessingHistoryDto {
  @ApiProperty({ format: 'uuid' })
  id: string;
  @ApiProperty()
  status: string;
  @ApiProperty()
  title: string;
  @ApiProperty({ type: String, nullable: true })
  description: string | null;
  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;
}

export class TransactionDetailsDto {
  @ApiProperty({
    type: [ProcessingHistoryDto],
    description: 'Latest processing history entries',
  })
  processingHistory: ProcessingHistoryDto[];
  @ApiProperty()
  id: string;
  @ApiProperty()
  transactionCode: string;
  @ApiProperty({ type: String, nullable: true })
  serviceName: string | null;
  @ApiProperty()
  userId: string;
  @ApiProperty({ type: String, nullable: true })
  bookingId: string | null;
  @ApiProperty({ type: String, nullable: true })
  parentTransactionId: string | null;
  @ApiProperty({ enum: TransactionType })
  transactionType: TransactionType;
  @ApiProperty({ enum: TransactionStatus })
  status: TransactionStatus;
  @ApiProperty()
  subtotal: string;
  @ApiProperty()
  totalAmount: string;
  @ApiProperty()
  gatewayFee: string;
  @ApiProperty({ type: String, nullable: true })
  currency: string | null;
  @ApiProperty({ type: String, nullable: true })
  paymentGateway: string | null;
  @ApiProperty({ type: String, nullable: true })
  gatewayReference: string | null;
  @ApiProperty({ type: String, nullable: true })
  invoiceNumber: string | null;
  @ApiProperty({ type: String, nullable: true })
  invoiceUrl: string | null;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  proceedAt: Date | null;
  @ApiProperty({ type: TransactionCustomerDto })
  user: TransactionCustomerDto;
  @ApiProperty({ type: [RelatedTransactionDto] })
  recentTransactions: RelatedTransactionDto[];
}

export class TransactionStatsResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;
  @ApiProperty({ example: 'Success' })
  message: string;
  @ApiProperty({ type: TransactionStatsDto })
  data: TransactionStatsDto;
}

export class TransactionListResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;
  @ApiProperty({ example: 'Success' })
  message: string;
  @ApiProperty({ type: [TransactionListItemDto] })
  data: TransactionListItemDto[];
  @ApiProperty()
  meta: PaginationMeta;
}

export class TransactionDetailsResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;
  @ApiProperty({ example: 'Success' })
  message: string;
  @ApiProperty({ type: TransactionDetailsDto })
  data: TransactionDetailsDto;
}
