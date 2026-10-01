import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeBookingLocationAndTransactionCurrencyNullable1790848800000 implements MigrationInterface {
  name = 'MakeBookingLocationAndTransactionCurrencyNullable1790848800000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "bookings" ALTER COLUMN "location" DROP NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "transactions" ALTER COLUMN "currency" DROP NOT NULL',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // Reverting requires all location and currency values to be filled first.
    await queryRunner.query(
      'ALTER TABLE "transactions" ALTER COLUMN "currency" SET NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "bookings" ALTER COLUMN "location" SET NOT NULL',
    );
  }
}
