import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingsRepository } from './repositories/bookings.repository';
import {
  calculatePagination,
  generatePaginationMeta,
} from '../../helpers/pagination.helper';
import { PaginatedData } from '../../common/types';
import { BookingListItemDto } from './dto/booking-list.dto';
import { ListBookingsQueryDto } from './dto/list-bookings-query.dto';
import { BookingStatsDto } from './dto/booking-stats.dto';
import { Booking } from './entities/booking.entity';

import { TransactionsService } from '../transactions/transactions.service';
import { BookingDetailsDto } from './dto/booking-details.dto';

import { DataSource } from 'typeorm';
import { BookingStatus } from '../../common/enums';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    private readonly repository: BookingsRepository,
    private readonly transactionsService: TransactionsService,
    private readonly dataSource: DataSource,
  ) {}

  async createBooking(dto: CreateBookingDto): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const user = await this.repository.findCustomer(manager, dto.user_id);
      if (!user) throw new NotFoundException('User not found');

      const amount = dto.amount.toFixed(2);
      const booking = await this.repository.createBooking(manager, {
        userId: dto.user_id,
        serviceName: dto.service_name.trim(),
        amount,
        durationMinutes: dto.duration,
        scheduleAt: new Date(dto.schedule_at),
      });
      await this.transactionsService.createPendingPayment(manager, {
        bookingId: booking.id,
        userId: dto.user_id,
        amount,
      });
    });
  }

  async updateBooking(id: string, dto: UpdateBookingDto): Promise<void> {
    if (
      Number(dto.reschedule === true) + Number(dto.cancel_booking === true) !==
      1
    ) {
      throw new BadRequestException(
        'Select exactly one action: reschedule or cancel_booking',
      );
    }
    if (dto.reschedule && !dto.schedule_at) {
      throw new BadRequestException(
        'schedule_at is required to reschedule a booking',
      );
    }
    if (!dto.reschedule && dto.schedule_at !== undefined) {
      throw new BadRequestException(
        'schedule_at is only allowed when rescheduling',
      );
    }
    await this.dataSource.transaction(async (manager) => {
      const booking = await this.repository.findForUpdate(manager, id);
      if (!booking) throw new NotFoundException('Booking not found');
      
      if (
        [BookingStatus.COMPLETED, BookingStatus.CANCELLED].includes(
          booking.status,
        )
      ) {
        throw new BadRequestException(
          'Completed or cancelled bookings cannot be changed',
        );
      }
      const changes: Partial<Booking> = dto.cancel_booking
        ? { status: BookingStatus.CANCELLED }
        : { scheduleAt: new Date(dto.schedule_at!) };
      await this.repository.updateBooking(manager, id, changes);
    });
  }

  async getBookingById(id: string): Promise<BookingDetailsDto> {
    const booking = await this.repository.findById(id);
    if (!booking) throw new NotFoundException('Booking not found');

    const [payment, totalBookingsCompleted] = await Promise.all([
      this.transactionsService.findBookingPayment(id),
      this.repository.countCompletedBookings(booking.userId),
    ]);

    return {
      id: booking.id,
      bookingCode: booking.bookingCode,
      status: booking.status,
      scheduledAt: booking.scheduleAt,
      serviceType: booking.serviceName,
      durationMinutes: booking.durationMinutes,
      location: booking.location,
      specialNotes: booking.specialNotes,
      payment: payment
        ? {
            billingAmount: payment.totalAmount,
            currency: payment.currency,
            status: payment.status,
            invoiceCode: payment.invoiceNumber,
            invoiceUrl: payment.invoiceUrl,
          }
        : null,
      customer: {
        id: booking.user.id,
        userCode: booking.user.userCode,
        name: booking.user.name,
        email: booking.user.email,
        avatarUrl: booking.user.avatarUrl,
        totalBookingsCompleted,
      },
    };
  }

  async getBookings(
    query: ListBookingsQueryDto,
  ): Promise<PaginatedData<BookingListItemDto>> {
    const { page, limit, offset } = calculatePagination(
      query.page,
      query.limit,
    );
    const [bookings, total] = await this.repository.findBookings(
      query,
      offset,
      limit,
    );
    const data = bookings.map((booking): BookingListItemDto => ({
      id: booking.id,
      bookingCode: booking.bookingCode,
      user: {
        id: booking.user.id,
        name: booking.user.name,
        avatarUrl: booking.user.avatarUrl,
      },
      serviceName: booking.serviceName,
      scheduleAt: booking.scheduleAt,
      durationMinutes: booking.durationMinutes,
      status: booking.status,
      amount: booking.amount,
    }));
    return { data, meta: generatePaginationMeta(page, limit, total) };
  }

  async getStats(): Promise<BookingStatsDto> {
    const { overall, currentMonth, previousMonth } =
      await this.repository.getStats();

    const percentage = (current: number, previous: number): number => {
      if (previous === 0) return current === 0 ? 0 : 100;
      return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    return {
      ...overall,
      comparison: {
        total: percentage(currentMonth.total, previousMonth.total),
        active: percentage(currentMonth.active, previousMonth.active),
        completed: percentage(currentMonth.completed, previousMonth.completed),
        cancelled: percentage(currentMonth.cancelled, previousMonth.cancelled),
      },
    };
  }

  findRecentBookings(userId: string): Promise<Booking[]> {
    return this.repository.findRecentBookings(userId);
  }
}
