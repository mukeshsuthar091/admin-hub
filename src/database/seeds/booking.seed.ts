import { DataSource } from 'typeorm';
import { Booking } from '../../modules/bookings/entities/booking.entity';
import { User } from '../../modules/users/entities/user.entity';
import { BookingStatus } from '../../common/enums';
import { generateCode } from '../../helpers/code.helper';

export async function seedBookings(dataSource: DataSource): Promise<void> {
  const bookingRepository = dataSource.getRepository(Booking);
  const user = await dataSource.getRepository(User).findOne({
    where: { email: 'admin@adminhub.com', isDelete: false },
  });

  if (!user) {
    throw new Error('Seed admin user not found. Run user seed first.');
  }

  const bookings = [
    {
      key: 'consultation',
      serviceName: 'Business Consultation',
      scheduleAt: '2026-09-20T10:00:00Z',
      durationMinutes: 60,
      location: 'Online',
      amount: '1500.00',
      status: BookingStatus.COMPLETED,
    },
    {
      key: 'training',
      serviceName: 'Team Training',
      scheduleAt: '2026-10-10T09:00:00Z',
      durationMinutes: 120,
      location: 'Mumbai Office',
      amount: '4000.00',
      status: BookingStatus.CONFIRMED,
    },
    {
      key: 'review',
      serviceName: 'Project Review',
      scheduleAt: '2026-10-15T11:00:00Z',
      durationMinutes: 45,
      location: 'Online',
      amount: '1000.00',
      status: BookingStatus.PENDING,
    },
    {
      key: 'workshop',
      serviceName: 'Strategy Workshop',
      scheduleAt: '2026-09-25T10:00:00Z',
      durationMinutes: 90,
      location: 'Delhi Office',
      amount: '3000.00',
      status: BookingStatus.CANCELLED,
    },
    {
      key: 'support',
      serviceName: 'Technical Support',
      scheduleAt: '2026-09-28T14:00:00Z',
      durationMinutes: 30,
      location: 'Online',
      amount: '500.00',
      status: BookingStatus.CANCELLED,
    },
  ];

  for (const item of bookings) {
    const specialNotes = `adminhub-seed:${item.key}`;
    const existingBooking = await bookingRepository.findOne({
      where: { userId: user.id, specialNotes },
    });

    if (existingBooking) {
      continue;
    }

    const bookingCode = await generateCode(
      dataSource,
      'booking_code_seq',
      'BKG',
    );
    const booking = bookingRepository.create({
      bookingCode,
      userId: user.id,
      serviceName: item.serviceName,
      scheduleAt: new Date(item.scheduleAt),
      durationMinutes: item.durationMinutes,
      location: item.location,
      specialNotes,
      amount: item.amount,
      status: item.status,
      isDelete: false,
    });

    await bookingRepository.save(booking);
  }

  const statuses = [
    BookingStatus.COMPLETED,
    BookingStatus.CONFIRMED,
    BookingStatus.PENDING,
    BookingStatus.CANCELLED,
    BookingStatus.CANCELLED,
  ];

  for (let i = 6; i <= 50; i++) {
    const specialNotes = `adminhub-seed:booking-${i}`;
    if (await bookingRepository.findOne({ where: { specialNotes } })) continue;

    const customer = await dataSource.getRepository(User).findOne({
      where: {
        email: `seed.user${String(i - 5).padStart(3, '0')}@adminhub.com`,
        isDelete: false,
      },
    });
    if (!customer)
      throw new Error('Seed customer not found. Run user seed first.');

    const sample = bookings[i % bookings.length];
    const status = statuses[i % statuses.length];
    const scheduleAt = new Date();
    scheduleAt.setUTCHours(9 + (i % 8), 0, 0, 0);
    const isUpcoming =
      status === BookingStatus.PENDING || status === BookingStatus.CONFIRMED;
    scheduleAt.setUTCDate(
      scheduleAt.getUTCDate() + (isUpcoming ? 1 + (i % 30) : -1 - (i % 60)),
    );
    const createdAt = new Date(scheduleAt);
    createdAt.setUTCDate(createdAt.getUTCDate() - (isUpcoming ? 45 : 7));

    const booking = bookingRepository.create({
      bookingCode: await generateCode(dataSource, 'booking_code_seq', 'BKG'),
      userId: customer.id,
      serviceName: sample.serviceName,
      scheduleAt,
      durationMinutes: sample.durationMinutes,
      location: sample.location,
      specialNotes,
      amount: (500 + (i % 15) * 250).toFixed(2),
      status,
      isDelete: false,
      createdAt,
    });
    await bookingRepository.save(booking);
  }

  console.log('Bookings seeded successfully (50 samples)');
}
