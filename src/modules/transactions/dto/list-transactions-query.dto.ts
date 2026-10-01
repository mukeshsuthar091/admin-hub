import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import {
  TransactionDateFilter,
  TransactionTypeFilter,
  TransactionAmountFilter,
} from '../type/transaction-query.enum';

export class ListTransactionsQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000000)
  page: number = 1;

  @ApiPropertyOptional({ default: 10, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Search transaction code, UUID or user name',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(150)
  search?: string;

  @ApiPropertyOptional({
    enum: TransactionDateFilter,
    default: TransactionDateFilter.ALL,
  })
  @IsEnum(TransactionDateFilter)
  date: TransactionDateFilter = TransactionDateFilter.ALL;

  @ApiPropertyOptional({
    enum: TransactionTypeFilter,
    default: TransactionTypeFilter.ALL,
  })
  @IsEnum(TransactionTypeFilter)
  type: TransactionTypeFilter = TransactionTypeFilter.ALL;

  @ApiPropertyOptional({
    enum: TransactionAmountFilter,
    default: TransactionAmountFilter.ALL,
  })
  @IsEnum(TransactionAmountFilter)
  amount: TransactionAmountFilter = TransactionAmountFilter.ALL;
}
