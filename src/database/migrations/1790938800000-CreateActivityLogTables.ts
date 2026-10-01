import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateActivityLogTables1790938800000 implements MigrationInterface {
  name = 'CreateActivityLogTables1790938800000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "user_activity_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamptz NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "action" varchar(100) NOT NULL, "title" varchar(255) NOT NULL, "description" text, "entity_type" varchar(50), "entity_id" uuid, "metadata" jsonb, "ip_address" inet, "user_agent" text, CONSTRAINT "PK_user_activity_logs" PRIMARY KEY ("id"), CONSTRAINT "FK_user_activity_logs_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT)',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_user_activity_logs_recent" ON "user_activity_logs" ("user_id", "created_at")',
    );
    await queryRunner.query(
      'CREATE TABLE "system_alerts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamptz NOT NULL DEFAULT now(), "type" varchar(30) NOT NULL, "title" varchar(255) NOT NULL, "description" text, "severity" varchar(20) NOT NULL, "metadata" jsonb, "is_read" boolean NOT NULL DEFAULT false, "expires_at" timestamptz, CONSTRAINT "PK_system_alerts" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_system_alerts_recent" ON "system_alerts" ("is_read", "created_at")',
    );
    await queryRunner.query(
      'CREATE TABLE "transaction_processing_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamptz NOT NULL DEFAULT now(), "transaction_id" uuid NOT NULL, "status" varchar(50) NOT NULL, "title" varchar(255) NOT NULL, "description" text, "metadata" jsonb, CONSTRAINT "PK_transaction_processing_logs" PRIMARY KEY ("id"), CONSTRAINT "FK_transaction_processing_logs_transaction_id" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT)',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_transaction_processing_logs_recent" ON "transaction_processing_logs" ("transaction_id", "created_at")',
    );
    await queryRunner.query(
      'CREATE TABLE "booking_lifecycle_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamptz NOT NULL DEFAULT now(), "booking_id" uuid NOT NULL, "event_type" varchar(50) NOT NULL, "title" varchar(255) NOT NULL, "description" text, "performed_by" uuid, "metadata" jsonb, CONSTRAINT "PK_booking_lifecycle_logs" PRIMARY KEY ("id"), CONSTRAINT "FK_booking_lifecycle_logs_booking_id" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT, CONSTRAINT "FK_booking_lifecycle_logs_performed_by" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE RESTRICT)',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_booking_lifecycle_logs_recent" ON "booking_lifecycle_logs" ("booking_id", "created_at")',
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "booking_lifecycle_logs"');
    await queryRunner.query('DROP TABLE "transaction_processing_logs"');
    await queryRunner.query('DROP TABLE "system_alerts"');
    await queryRunner.query('DROP TABLE "user_activity_logs"');
  }
}
