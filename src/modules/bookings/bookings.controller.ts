import {
  Body,
  Post,
  Patch,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards';
import { PaginatedData } from '../../common/types';
import { BookingsService } from './bookings.service';
import { ListBookingsQueryDto } from './dto/list-bookings-query.dto';
import {
  BookingListItemDto,
  BookingListResponseDto,
} from './dto/booking-list.dto';
import {
  BookingStatsDto,
  BookingStatsResponseDto,
} from './dto/booking-stats.dto';

import { ResponseMessage } from '../../common/decorators';
import {
  BookingDetailsDto,
  BookingDetailsResponseDto,
} from './dto/booking-details.dto';

import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@ApiTags('Bookings')
@ApiBearerAuth('JWT-auth')
@ApiUnauthorizedResponse({
  description: 'Missing/invalid token or disabled account',
})
@UseGuards(AuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ResponseMessage('Booking created successfully')
  @ApiOperation({
    summary: 'Create a pending booking and pending payment together',
  })
  @ApiCreatedResponse({
    description: 'Booking created successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 201 },
        message: { type: 'string', example: 'Booking created successfully' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid booking fields' })
  @ApiNotFoundResponse({ description: 'User not found' })
  createBooking(@Body() dto: CreateBookingDto): Promise<void> {
    return this.bookingsService.createBooking(dto);
  }

  @Patch(':id')
  @ResponseMessage('Booking updated successfully')
  @ApiOperation({
    summary: 'Reschedule or cancel a pending or confirmed booking',
  })
  @ApiOkResponse({
    description: 'Booking updated successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Booking updated successfully' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid action, date, UUID or booking state',
  })
  @ApiNotFoundResponse({ description: 'Booking not found' })
  updateBooking(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookingDto,
  ): Promise<void> {
    return this.bookingsService.updateBooking(id, dto);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Booking totals and monthly percentage comparisons',
  })
  @ApiOkResponse({ type: BookingStatsResponseDto })
  getStats(): Promise<BookingStatsDto> {
    return this.bookingsService.getStats();
  }

  @Get()
  @ApiOperation({
    summary:
      'Paginated bookings with service search, status and schedule filters',
  })
  @ApiOkResponse({ type: BookingListResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid query fields' })
  getBookings(
    @Query() query: ListBookingsQueryDto,
  ): Promise<PaginatedData<BookingListItemDto>> {
    return this.bookingsService.getBookings(query);
  }

  @Get(':id')
  @ResponseMessage('Booking details fetched successfully')
  @ApiOperation({
    summary: 'Fetch booking details, payment and customer by ID',
  })
  @ApiOkResponse({ type: BookingDetailsResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid booking UUID' })
  @ApiNotFoundResponse({ description: 'Booking not found' })
  getBookingById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BookingDetailsDto> {
    return this.bookingsService.getBookingById(id);
  }
}
