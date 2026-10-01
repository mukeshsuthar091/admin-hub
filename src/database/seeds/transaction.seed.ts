import { DataSource } from 'typeorm';
import { Transaction } from '../../modules/transactions/entities/transactions.entity';
import { Booking } from '../../modules/bookings/entities/booking.entity';
import { User } from '../../modules/users/entities/user.entity';
import { TransactionStatus, TransactionType } from '../../common/enums';
import { generateCode } from '../../helpers/code.helper';

export async function seedTransactions(dataSource: DataSource): Promise<void> {
  const transactionRepository = dataSource.getRepository(Transaction);
  const bookingRepository = dataSource.getRepository(Booking);
  const user = await dataSource.getRepository(User).findOne({
    where: { email: 'admin@adminhub.com', isDelete: false },
  });

  if (!user) {
    throw new Error('Seed admin user not found. Run user seed first.');
  }

  const transactions = [
    {
      bookingKey: 'consultation',
      type: TransactionType.PAYMENT,
      status: TransactionStatus.COMPLETED,
      proceedAt: '2026-09-19T10:00:00Z',
    },
    {
      bookingKey: 'training',
      type: TransactionType.PAYMENT,
      status: TransactionStatus.PROCESSING,
      proceedAt: null,
    },
    {
      bookingKey: 'review',
      type: TransactionType.PAYMENT,
      status: TransactionStatus.PENDING,
      proceedAt: null,
    },
    {
      bookingKey: 'workshop',
      type: TransactionType.PAYMENT,
      status: TransactionStatus.REFUNDED,
      proceedAt: '2026-09-23T10:00:00Z',
    },
    {
      bookingKey: 'workshop',
      type: TransactionType.REFUND,
      status: TransactionStatus.COMPLETED,
      proceedAt: '2026-09-24T10:00:00Z',
    },
    {
      bookingKey: 'support',
      type: TransactionType.PAYMENT,
      status: TransactionStatus.FAILED,
      proceedAt: null,
    },
  ];

  for (const item of transactions) {
    const gatewayReference = `adminhub-seed:${item.bookingKey}:${item.type}`;
    const existingTransaction = await transactionRepository.findOne({
      where: { userId: user.id, gatewayReference },
    });

    if (existingTransaction) {
      continue;
    }

    const booking = await bookingRepository.findOne({
      where: {
        userId: user.id,
        specialNotes: `adminhub-seed:${item.bookingKey}`,
        isDelete: false,
      },
    });

    if (!booking) {
      throw new Error(
        `Seed booking '${item.bookingKey}' not found. Run booking seed first.`,
      );
    }

    const transactionCode = await generateCode(
      dataSource,
      'transaction_code_seq',
      'TXN',
    );
    const transaction = transactionRepository.create({
      transactionCode,
      userId: user.id,
      bookingId: booking.id,
      transactionType: item.type,
      status: item.status,
      subtotal: booking.amount,
      totalAmount: booking.amount,
      currency: 'INR',
      paymentGateway: 'seed-demo',
      gatewayReference,
      gatewayFee: '0.00',
      invoiceNumber:
        item.type === TransactionType.PAYMENT &&
        [TransactionStatus.COMPLETED, TransactionStatus.REFUNDED].includes(
          item.status,
        )
          ? `INV-${transactionCode}`
          : null,
      invoiceUrl: null,
      proceedAt: item.proceedAt ? new Date(item.proceedAt) : null,
      isDelete: false,
    });

    await transactionRepository.save(transaction);
  }

  const statuses = [
    TransactionStatus.COMPLETED,
    TransactionStatus.PROCESSING,
    TransactionStatus.PENDING,
    TransactionStatus.REFUNDED,
    TransactionStatus.FAILED,
  ];

  for (let i = 6; i <= 50; i++) {
    const booking = await bookingRepository.findOne({
      where: { specialNotes: `adminhub-seed:booking-${i}`, isDelete: false },
    });
    if (!booking)
      throw new Error(`Seed booking ${i} not found. Run booking seed first.`);

    const types =
      i % 5 === 3
        ? [TransactionType.PAYMENT, TransactionType.REFUND]
        : [TransactionType.PAYMENT];
    for (const type of types) {
      const gatewayReference = `adminhub-seed:booking-${i}:${type}`;
      if (await transactionRepository.findOne({ where: { gatewayReference } }))
        continue;

      const status =
        type === TransactionType.REFUND
          ? TransactionStatus.COMPLETED
          : statuses[i % statuses.length];
      const createdAt = new Date(booking.createdAt);
      createdAt.setUTCDate(
        createdAt.getUTCDate() + (type === TransactionType.REFUND ? 2 : 1),
      );
      const processed =
        status === TransactionStatus.COMPLETED ||
        status === TransactionStatus.REFUNDED;
      const transactionCode = await generateCode(
        dataSource,
        'transaction_code_seq',
        'TXN',
      );
      const transaction = transactionRepository.create({
        transactionCode,
        userId: booking.userId,
        bookingId: booking.id,
        transactionType: type,
        status,
        subtotal: booking.amount,
        totalAmount: booking.amount,
        currency: 'INR',
        paymentGateway: i % 2 === 0 ? 'seed-demo-card' : 'seed-demo-upi',
        gatewayReference,
        gatewayFee: '0.00',
        invoiceNumber:
          type === TransactionType.PAYMENT && processed
            ? `INV-${transactionCode}`
            : null,
        invoiceUrl: null,
        proceedAt: processed ? createdAt : null,
        isDelete: false,
        createdAt,
      });
      await transactionRepository.save(transaction);
    }
  }

  console.log('Transactions seeded successfully (60 samples)');
}
