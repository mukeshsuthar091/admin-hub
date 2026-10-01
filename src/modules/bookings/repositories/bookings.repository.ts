import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../entities/booking.entity';

@Injectable()
export class BookingsRepository {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

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
