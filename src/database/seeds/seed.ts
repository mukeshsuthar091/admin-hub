import dataSourcePromise from '../data-source';
import { seedRoles } from './role.seed';
import { seedSuperAdmin, seedUsers } from './user.seed';
import { seedBookings } from './booking.seed';
import { seedTransactions } from './transaction.seed';

async function runSeed(): Promise<void> {
  const dataSource = await dataSourcePromise;

  try {
    await dataSource.initialize();
    await seedRoles(dataSource);
    await seedSuperAdmin(dataSource);
    await seedUsers(dataSource);
    await seedBookings(dataSource);
    await seedTransactions(dataSource);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }

  console.log('Seed completed successfully');
}

runSeed().catch((error: unknown) => {
  console.error('Seed failed', error);
  process.exitCode = 1;
});
