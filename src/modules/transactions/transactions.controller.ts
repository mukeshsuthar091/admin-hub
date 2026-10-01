import {
  Body,
  Post,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards';
import { PaginatedData } from '../../common/types';
import { TransactionsService } from './transactions.service';
import { ListTransactionsQueryDto } from './dto/list-transactions-query.dto';
import {
  TransactionStatsDto,
  TransactionStatsResponseDto,
  TransactionListItemDto,
  TransactionListResponseDto,
  TransactionDetailsDto,
  TransactionDetailsResponseDto,
} from './dto/transaction-response.dto';

import { ResponseMessage } from '../../common/decorators';
import {
  RefundTransactionDto,
  RefundResultDto,
  RefundResponseDto,
} from './dto/refund-transaction.dto';

@ApiTags('Transactions')
@ApiBearerAuth('JWT-auth')
@ApiUnauthorizedResponse({
  description: 'Missing/invalid access token or disabled account',
})
@UseGuards(AuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post(':id/refund')
  @ResponseMessage('Transaction refunded successfully')
  @ApiOperation({
    summary: 'Record a full refund of a completed payment atomically',
    description:
      'Database ledger operation; does not call an external payment gateway.',
  })
  @ApiCreatedResponse({ type: RefundResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid UUID, amount or ineligible transaction',
  })
  @ApiNotFoundResponse({ description: 'Transaction not found' })
  @ApiConflictResponse({ description: 'Transaction already fully refunded' })
  refundTransaction(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RefundTransactionDto,
  ): Promise<RefundResultDto> {
    return this.transactionsService.refundTransaction(id, dto);
  }

  @Get('stats')
  @ApiOperation({
    summary:
      'Transaction count, nominal volume, average and completed success rate',
  })
  @ApiOkResponse({ type: TransactionStatsResponseDto })
  getStats(): Promise<TransactionStatsDto> {
    return this.transactionsService.getStats();
  }

  @Get()
  @ApiOperation({
    summary:
      'Paginated transactions with search, date, type and amount filters',
  })
  @ApiOkResponse({ type: TransactionListResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid query fields' })
  getTransactions(
    @Query() query: ListTransactionsQueryDto,
  ): Promise<PaginatedData<TransactionListItemDto>> {
    return this.transactionsService.getTransactions(query);
  }

  @Get(':id')
  @ApiOperation({
    summary:
      'Transaction details, customer and two recent related transactions',
  })
  @ApiOkResponse({ type: TransactionDetailsResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid transaction UUID' })
  @ApiNotFoundResponse({ description: 'Transaction not found' })
  getTransactionById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TransactionDetailsDto> {
    return this.transactionsService.getTransactionById(id);
  }
}
