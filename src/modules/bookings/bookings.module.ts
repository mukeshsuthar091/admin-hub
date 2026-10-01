import { BookingLifecycleLog } from './entities/booking-lifecycle-log.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { BookingsRepository } from './repositories/bookings.repository';
import { AuthGuard } from '../../common/guards';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, BookingLifecycleLog]),
    TransactionsModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsRepository, BookingsService, AuthGuard],
  exports: [BookingsService],
})
export class BookingsModule {}
