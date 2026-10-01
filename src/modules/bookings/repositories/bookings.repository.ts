import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BookingStatus } from '../../../common/enums';
import { ListBookingsQueryDto } from '../dto/list-bookings-query.dto';
import { BookingStatsCounts } from '../types/booking-stats.interface';
import { Booking } from '../entities/booking.entity';

import { User } from '../../users/entities/user.entity';
import { generateCode } from '../../../helpers/code.helper';

@Injectable()
export class BookingsRepository {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  findCustomer(manager: EntityManager, id: string): Promise<User | null> {
    return manager.getRepository(User).findOne({
      where: { id, isDelete: false },
      select: { id: true },
      lock: { mode: 'pessimistic_read' },
    });
  }

  async createBooking(
    manager: EntityManager,
    data: {
      userId: string;
      serviceName: string;
      amount: string;
      durationMinutes: number;
      scheduleAt: Date;
    },
  ): Promise<Booking> {
    const repository = manager.getRepository(Booking);
    const bookingCode = await generateCode(
      manager.connection,
      'booking_code_seq',
      'BKG',
    );
    return repository.save(
      repository.create({
        ...data,
        location: null,
        bookingCode,
        status: BookingStatus.PENDING,
      }),
    );
  }

  findForUpdate(manager: EntityManager, id: string): Promise<Booking | null> {
    return manager.getRepository(Booking).findOne({
      where: { id, isDelete: false },
      lock: { mode: 'pessimistic_write' },
    });
  }

  async updateBooking(
    manager: EntityManager,
    id: string,
    changes: Partial<Booking>,
  ): Promise<void> {
    await manager
      .getRepository(Booking)
      .update({ id, isDelete: false }, changes);
  }

  findById(id: string): Promise<Booking | null> {
    return this.bookingRepository.findOne({
      where: { id, isDelete: false },
      relations: { user: true },
      select: {
        id: true,
        bookingCode: true,
        userId: true,
        status: true,
        scheduleAt: true,
        serviceName: true,
        durationMinutes: true,
        location: true,
        specialNotes: true,
        amount: true,
        user: {
          id: true,
          userCode: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    });
  }

  countCompletedBookings(userId: string): Promise<number> {
    return this.bookingRepository.count({
      where: { userId, status: BookingStatus.COMPLETED, isDelete: false },
    });
  }

  findBookings(
    filters: ListBookingsQueryDto,
    offset: number,
    limit: number,
  ): Promise<[Booking[], number]> {
    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .innerJoin('booking.user', 'user')
      .select([
        'booking.id',
        'booking.bookingCode',
        'booking.serviceName',
        'booking.scheduleAt',
        'booking.durationMinutes',
        'booking.status',
        'booking.amount',
        'user.id',
        'user.name',
        'user.avatarUrl',
      ])
      .where('booking.isDelete = :isDelete', { isDelete: false });

    if (filters.search) {
      const search = `%${filters.search.replace(/[\\%_]/g, '\\$&')}%`;
      query.andWhere('booking.serviceName ILIKE :search', { search });
    }
    if (filters.status && filters.status !== 'all') {
      query.andWhere('booking.status = :status', { status: filters.status });
    }
    if (filters.when === 'upcoming')
      query.andWhere('booking.scheduleAt >= CURRENT_TIMESTAMP');
    if (filters.when === 'past')
      query.andWhere('booking.scheduleAt < CURRENT_TIMESTAMP');

    return query
      .orderBy('booking.scheduleAt', 'DESC')
      .addOrderBy('booking.id', 'ASC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();
  }

  async getStats(): Promise<BookingStatsCounts> {
    const localStart =
      "DATE_TRUNC('month', CURRENT_TIMESTAMP AT TIME ZONE :timezone)";
    const currentRange = `booking.createdAt >= (${localStart} AT TIME ZONE :timezone) AND booking.createdAt < ((${localStart} + INTERVAL '1 month') AT TIME ZONE :timezone)`;
    const previousRange = `booking.createdAt >= ((${localStart} - INTERVAL '1 month') AT TIME ZONE :timezone) AND booking.createdAt < (${localStart} AT TIME ZONE :timezone)`;
    const conditions = {
      total: 'TRUE',
      active: 'booking.status IN (:pending, :confirmed)',
      completed: 'booking.status = :completed',
      cancelled: 'booking.status = :cancelled',
    };
    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.isDelete = :isDelete', { isDelete: false })
      .setParameters({
        timezone: process.env.APP_TIMEZONE || 'UTC',
        pending: BookingStatus.PENDING,
        confirmed: BookingStatus.CONFIRMED,
        completed: BookingStatus.COMPLETED,
        cancelled: BookingStatus.CANCELLED,
      });
    query.select([]);
    for (const [key, condition] of Object.entries(conditions)) {
      query.addSelect(`COUNT(*) FILTER (WHERE ${condition})`, key);
      query.addSelect(
        `COUNT(*) FILTER (WHERE (${condition}) AND ${currentRange})`,
        `current_${key}`,
      );
      query.addSelect(
        `COUNT(*) FILTER (WHERE (${condition}) AND ${previousRange})`,
        `previous_${key}`,
      );
    }
    const result = await query.getRawOne<Record<string, string>>();
    const counts = (prefix: string) => ({
      total: Number(result?.[`${prefix}total`] ?? 0),
      active: Number(result?.[`${prefix}active`] ?? 0),
      completed: Number(result?.[`${prefix}completed`] ?? 0),
      cancelled: Number(result?.[`${prefix}cancelled`] ?? 0),
    });
    return {
      overall: counts(''),
      currentMonth: counts('current_'),
      previousMonth: counts('previous_'),
    };
  }

  findRecentBookings(userId: string): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { userId, isDelete: false },
      select: {
        id: true,
        bookingCode: true,
        serviceName: true,
        status: true,
        scheduleAt: true,
      },
      order: { createdAt: 'DESC', id: 'DESC' },
      take: 2,
    });
  }
}
