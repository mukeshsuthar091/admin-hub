import { createHash } from 'node:crypto';
import { DataSource } from 'typeorm';
import { TransactionStatus } from '../../common/enums';
import { User } from '../../modules/users/entities/user.entity';
import { Booking } from '../../modules/bookings/entities/booking.entity';
import { Transaction } from '../../modules/transactions/entities/transactions.entity';
import { UserActivityLog } from '../../modules/users/entities/user-activity-log.entity';
import { SystemAlert } from '../../modules/dashboard/entities/system-alert.entity';
import { TransactionProcessingLog } from '../../modules/transactions/entities/transaction-processing-log.entity';
import { BookingLifecycleLog } from '../../modules/bookings/entities/booking-lifecycle-log.entity';

function sampleId(key: string): string {
  const hash = createHash('sha256')
    .update(`adminhub-log-seed:${key}`)
    .digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export async function seedLogs(dataSource: DataSource): Promise<void> {
  await dataSource.transaction(async (manager) => {
    const users = await manager.getRepository(User).find({
      where: { isDelete: false },
      order: { userCode: 'ASC' },
      take: 10,
    });
    const bookings = await manager.getRepository(Booking).find({
      where: { isDelete: false },
      order: { bookingCode: 'ASC' },
      take: 10,
    });
    const transactions = await manager.getRepository(Transaction).find({
      where: { isDelete: false },
      order: { transactionCode: 'ASC' },
      take: 10,
    });
    if (!users.length || !bookings.length || !transactions.length) {
      throw new Error(
        'Run user, booking and transaction seeds before log seeds.',
      );
    }

    const metadata = { source: 'seed', sample: true };
    const ago = (hours: number): Date =>
      new Date(Date.now() - hours * 60 * 60 * 1000);
    await manager
      .getRepository(SystemAlert)
      .createQueryBuilder()
      .insert()
      .values([
        {
          id: sampleId('alert-capacity'),
          type: 'capacity',
          severity: 'critical',
          title: 'Server capacity at 92%',
          description: 'Sample alert: scale resources',
          metadata,
          createdAt: ago(2),
        },
        {
          id: sampleId('alert-pending'),
          type: 'transaction',
          severity: 'warning',
          title: `${transactions.filter((item) => item.status === TransactionStatus.PENDING).length} sampled transactions pending`,
          description: 'Sample alert: pending review',
          metadata,
          createdAt: ago(5),
        },
        {
          id: sampleId('alert-maintenance'),
          type: 'maintenance',
          severity: 'info',
          title: 'System maintenance scheduled',
          description: 'Sample scheduled maintenance notification',
          metadata,
          createdAt: ago(24),
        },
      ])
      .orIgnore()
      .execute();

    for (const user of users) {
      await manager
        .getRepository(UserActivityLog)
        .createQueryBuilder()
        .insert()
        .values([
          {
            id: sampleId(`user-${user.id}-created`),
            userId: user.id,
            action: 'account_created',
            title: 'User account created',
            description: `Sample activity for ${user.name}`,
            entityType: 'user',
            entityId: user.id,
            metadata,
            createdAt: user.createdAt,
          },
          {
            id: sampleId(`user-${user.id}-login`),
            userId: user.id,
            action: 'login',
            title: 'Logged in from a new device',
            description: 'Sample login activity',
            ipAddress: '127.0.0.1',
            userAgent: 'AdminHub seed client',
            metadata,
            createdAt: ago(2),
          },
        ])
        .orIgnore()
        .execute();
    }

    for (const booking of bookings) {
      await manager
        .getRepository(BookingLifecycleLog)
        .createQueryBuilder()
        .insert()
        .values([
          {
            id: sampleId(`booking-${booking.id}-created`),
            bookingId: booking.id,
            eventType: 'created',
            title: 'Booking created',
            description: booking.serviceName,
            performedBy: booking.userId,
            metadata,
            createdAt: booking.createdAt,
          },
          {
            id: sampleId(`booking-${booking.id}-status`),
            bookingId: booking.id,
            eventType: 'status_recorded',
            title: `Booking status: ${booking.status}`,
            description: 'Sample current booking status',
            performedBy: booking.userId,
            metadata,
            createdAt: booking.updatedAt,
          },
        ])
        .orIgnore()
        .execute();
      await manager
        .getRepository(UserActivityLog)
        .createQueryBuilder()
        .insert()
        .values({
          id: sampleId(`booking-${booking.id}-activity`),
          userId: booking.userId,
          action: 'booking_created',
          title: `Created booking #${booking.bookingCode}`,
          description: booking.serviceName,
          entityType: 'booking',
          entityId: booking.id,
          metadata,
          createdAt: booking.createdAt,
        })
        .orIgnore()
        .execute();
    }

    for (const transaction of transactions) {
      await manager
        .getRepository(TransactionProcessingLog)
        .createQueryBuilder()
        .insert()
        .values([
          {
            id: sampleId(`transaction-${transaction.id}-initiated`),
            transactionId: transaction.id,
            status: 'pending',
            title: 'Initiated',
            description: 'Sample transaction initiation',
            metadata,
            createdAt: transaction.createdAt,
          },
          {
            id: sampleId(`transaction-${transaction.id}-status`),
            transactionId: transaction.id,
            status: transaction.status,
            title: `Transaction status: ${transaction.status}`,
            description: 'Sample current processing status',
            metadata,
            createdAt: transaction.proceedAt ?? transaction.updatedAt,
          },
        ])
        .orIgnore()
        .execute();
    }
  });
  console.log('System alerts and activity logs seeded successfully');
}
