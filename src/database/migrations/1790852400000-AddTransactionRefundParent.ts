import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTransactionRefundParent1790852400000 implements MigrationInterface {
  name = 'AddTransactionRefundParent1790852400000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "transactions" ADD "parent_transaction_id" uuid',
    );
    await queryRunner.query(
      'ALTER TABLE "transactions" ADD CONSTRAINT "FK_transactions_parent" FOREIGN KEY ("parent_transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_transactions_parent_transaction_id" ON "transactions" ("parent_transaction_id")',
    );
    await queryRunner.query(
      'ALTER TABLE "transactions" DROP CONSTRAINT "CHK_transactions_amounts"',
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "CHK_transactions_amounts" CHECK ("gateway_fee" >= 0 AND (("subtotal" >= 0 AND "total_amount" >= 0 AND "parent_transaction_id" IS NULL) OR ("transaction_type" = 'refund' AND "parent_transaction_id" IS NOT NULL AND "subtotal" < 0 AND "total_amount" < 0)))`,
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    // Negative refunds must be reconciled before restoring the old constraint.
    await queryRunner.query(
      'ALTER TABLE "transactions" DROP CONSTRAINT "CHK_transactions_amounts"',
    );
    await queryRunner.query(
      'ALTER TABLE "transactions" ADD CONSTRAINT "CHK_transactions_amounts" CHECK ("subtotal" >= 0 AND "total_amount" >= 0 AND "gateway_fee" >= 0)',
    );
    await queryRunner.query(
      'DROP INDEX "IDX_transactions_parent_transaction_id"',
    );
    await queryRunner.query(
      'ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_parent"',
    );
    await queryRunner.query(
      'ALTER TABLE "transactions" DROP COLUMN "parent_transaction_id"',
    );
  }
}
