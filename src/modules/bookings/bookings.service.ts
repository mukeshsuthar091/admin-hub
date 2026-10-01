import { Injectable } from '@nestjs/common';
import { BookingsRepository } from './repositories/bookings.repository';
import { Booking } from './entities/booking.entity';

@Injectable()
export class BookingsService {
  constructor(private readonly repository: BookingsRepository) {}

  findRecentBookings(userId: string): Promise<Booking[]> {
    return this.repository.findRecentBookings(userId);
  }
}
