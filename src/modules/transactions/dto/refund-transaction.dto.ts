import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsNumber, Max, Min, ValidateIf } from 'class-validator';
import { TransactionDetailsDto } from './transaction-response.dto';

export class RefundRecordDto extends OmitType(TransactionDetailsDto, [
  'serviceName',
  'user',
  'recentTransactions',
] as const) {
  @ApiProperty()
  isDelete: boolean;
}

export class RefundTransactionDto {
  @ApiPropertyOptional({
    example: 120,
    description:
      'Full refund amount. Omit to refund the full original total; partial refunds are not supported.',
  })
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(9999999999.99)
  amount?: number;
}

export class RefundResultDto {
  @ApiProperty({ type: RefundRecordDto })
  originalTransaction: RefundRecordDto;

  @ApiProperty({ type: RefundRecordDto })
  refundTransaction: RefundRecordDto;
}

export class RefundResponseDto {
  @ApiProperty({ example: 201 })
  statusCode: number;
  @ApiProperty({ example: 'Transaction refunded successfully' })
  message: string;
  @ApiProperty({ type: RefundResultDto })
  data: RefundResultDto;
}
