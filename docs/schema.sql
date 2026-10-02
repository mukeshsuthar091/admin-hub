-- Fresh database reference, assembled from the committed migrations.
-- Prefer npm run migration:run, which also records migration history.
-- Do not apply this file to an existing database.
BEGIN;

-- 1790835793722-CreateAdminHubSchema.ts
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1790835793722-CreateAdminHubSchema.ts
CREATE SEQUENCE "role_code_seq" START WITH 1;

-- 1790835793722-CreateAdminHubSchema.ts
CREATE SEQUENCE "user_code_seq" START WITH 1;

-- 1790835793722-CreateAdminHubSchema.ts
CREATE SEQUENCE "booking_code_seq" START WITH 1;

-- 1790835793722-CreateAdminHubSchema.ts
CREATE SEQUENCE "transaction_code_seq" START WITH 1;

-- 1790835793722-CreateAdminHubSchema.ts
CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "role_code" character varying(50) NOT NULL, "name" character varying(100) NOT NULL, "description" text, "is_delete" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_3feee96f9a604421f24496988db" UNIQUE ("role_code"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"));

-- 1790835793722-CreateAdminHubSchema.ts
CREATE TYPE "user_status_enum" AS ENUM('active', 'suspended', 'inactive');

-- 1790835793722-CreateAdminHubSchema.ts
CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "role_id" uuid NOT NULL, "user_code" character varying(50) NOT NULL, "name" character varying(150) NOT NULL, "email" character varying(254) NOT NULL, "phone_number" character varying(30), "dob" date, "password" character varying(255) NOT NULL, "avatar_url" text, "address" text, "city" character varying(100), "state" character varying(100), "country" character varying(100), "status" "user_status_enum" NOT NULL DEFAULT 'active', "is_delete" boolean NOT NULL DEFAULT false, "last_active_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_23351656ab098559729ac15f50a" UNIQUE ("user_code"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"));

-- 1790835793722-CreateAdminHubSchema.ts
CREATE INDEX "IDX_users_role_id" ON "users"  ("role_id") ;

-- 1790835793722-CreateAdminHubSchema.ts
CREATE INDEX "IDX_users_name" ON "users"  ("name") ;

-- 1790835793722-CreateAdminHubSchema.ts
CREATE INDEX "IDX_users_status_is_delete" ON "users"  ("status", "is_delete") ;

-- 1790835793722-CreateAdminHubSchema.ts
CREATE TYPE "booking_status_enum" AS ENUM('pending', 'confirmed', 'completed', 'cancelled');

-- 1790835793722-CreateAdminHubSchema.ts
CREATE TABLE "bookings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "booking_code" character varying(50) NOT NULL, "user_id" uuid NOT NULL, "service_name" character varying(150) NOT NULL, "schedule_at" TIMESTAMP WITH TIME ZONE NOT NULL, "duration_minutes" integer NOT NULL, "location" text NOT NULL, "special_notes" text, "amount" numeric(12,2) NOT NULL, "status" "booking_status_enum" NOT NULL DEFAULT 'pending', "is_delete" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_796e0227e4beff186bdd72ac53b" UNIQUE ("booking_code"), CONSTRAINT "CHK_bookings_amount" CHECK ("amount" >= 0), CONSTRAINT "CHK_bookings_duration" CHECK ("duration_minutes" > 0), CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id"));

-- 1790835793722-CreateAdminHubSchema.ts
CREATE INDEX "IDX_bookings_user_id" ON "bookings"  ("user_id") ;

-- 1790835793722-CreateAdminHubSchema.ts
CREATE INDEX "IDX_bookings_schedule_at" ON "bookings"  ("schedule_at") ;

-- 1790835793722-CreateAdminHubSchema.ts
CREATE INDEX "IDX_bookings_status_schedule_at" ON "bookings"  ("status", "schedule_at") ;

-- 1790835793722-CreateAdminHubSchema.ts
CREATE TYPE "transaction_type_enum" AS ENUM('payment', 'refund', 'transfer');

-- 1790835793722-CreateAdminHubSchema.ts
CREATE TYPE "transaction_status_enum" AS ENUM('pending', 'processing', 'completed', 'failed', 'refunded');

-- 1790835793722-CreateAdminHubSchema.ts
CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "transaction_code" character varying(50) NOT NULL, "user_id" uuid NOT NULL, "booking_id" uuid, "transaction_type" "transaction_type_enum" NOT NULL, "status" "transaction_status_enum" NOT NULL DEFAULT 'pending', "subtotal" numeric(12,2) NOT NULL, "total_amount" numeric(12,2) NOT NULL, "currency" character varying(3) NOT NULL, "payment_gateway" character varying(100), "gateway_reference" character varying(255), "gateway_fee" numeric(12,2) NOT NULL DEFAULT '0', "invoice_number" character varying(100), "invoice_url" text, "is_delete" boolean NOT NULL DEFAULT false, "proceed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_b6ad9578dad7e7a9de482a2d98c" UNIQUE ("transaction_code"), CONSTRAINT "CHK_transactions_amounts" CHECK ("subtotal" >= 0 AND "total_amount" >= 0 AND "gateway_fee" >= 0), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"));

-- 1790835793722-CreateAdminHubSchema.ts
CREATE INDEX "IDX_transactions_user_id" ON "transactions"  ("user_id") ;

-- 1790835793722-CreateAdminHubSchema.ts
CREATE INDEX "IDX_transactions_booking_id" ON "transactions"  ("booking_id") ;

-- 1790835793722-CreateAdminHubSchema.ts
CREATE INDEX "IDX_transactions_status_created_at" ON "transactions"  ("status", "createdAt") ;

-- 1790835793722-CreateAdminHubSchema.ts
CREATE TABLE "app_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "access_token" text NOT NULL, "refresh_token" text NOT NULL, "device_token" text, "ip_address" inet, "is_expired" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_4540a4d5875459c9da0fd643968" PRIMARY KEY ("id"));

-- 1790835793722-CreateAdminHubSchema.ts
CREATE INDEX "IDX_app_tokens_user_id_is_expired" ON "app_tokens"  ("user_id", "is_expired") ;

-- 1790835793722-CreateAdminHubSchema.ts
ALTER TABLE "users" ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- 1790835793722-CreateAdminHubSchema.ts
ALTER TABLE "bookings" ADD CONSTRAINT "FK_64cd97487c5c42806458ab5520c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- 1790835793722-CreateAdminHubSchema.ts
ALTER TABLE "transactions" ADD CONSTRAINT "FK_e9acc6efa76de013e8c1553ed2b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- 1790835793722-CreateAdminHubSchema.ts
ALTER TABLE "transactions" ADD CONSTRAINT "FK_fba75deb63bb89de7b5fc92746a" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- 1790835793722-CreateAdminHubSchema.ts
ALTER TABLE "app_tokens" ADD CONSTRAINT "FK_3628d017538618fdfa837c130d5" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- 1790848800000-MakeBookingLocationAndTransactionCurrencyNullable.ts
ALTER TABLE "bookings" ALTER COLUMN "location" DROP NOT NULL;

-- 1790848800000-MakeBookingLocationAndTransactionCurrencyNullable.ts
ALTER TABLE "transactions" ALTER COLUMN "currency" DROP NOT NULL;

-- 1790852400000-AddTransactionRefundParent.ts
ALTER TABLE "transactions" ADD "parent_transaction_id" uuid;

-- 1790852400000-AddTransactionRefundParent.ts
ALTER TABLE "transactions" ADD CONSTRAINT "FK_transactions_parent" FOREIGN KEY ("parent_transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT;

-- 1790852400000-AddTransactionRefundParent.ts
CREATE UNIQUE INDEX "IDX_transactions_parent_transaction_id" ON "transactions" ("parent_transaction_id");

-- 1790852400000-AddTransactionRefundParent.ts
ALTER TABLE "transactions" DROP CONSTRAINT "CHK_transactions_amounts";

-- 1790852400000-AddTransactionRefundParent.ts
ALTER TABLE "transactions" ADD CONSTRAINT "CHK_transactions_amounts" CHECK ("gateway_fee" >= 0 AND (("subtotal" >= 0 AND "total_amount" >= 0 AND "parent_transaction_id" IS NULL) OR ("transaction_type" = 'refund' AND "parent_transaction_id" IS NOT NULL AND "subtotal" < 0 AND "total_amount" < 0)));

-- 1790938800000-CreateActivityLogTables.ts
CREATE TABLE "user_activity_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamptz NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "action" varchar(100) NOT NULL, "title" varchar(255) NOT NULL, "description" text, "entity_type" varchar(50), "entity_id" uuid, "metadata" jsonb, "ip_address" inet, "user_agent" text, CONSTRAINT "PK_user_activity_logs" PRIMARY KEY ("id"), CONSTRAINT "FK_user_activity_logs_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT);

-- 1790938800000-CreateActivityLogTables.ts
CREATE INDEX "IDX_user_activity_logs_recent" ON "user_activity_logs" ("user_id", "created_at");

-- 1790938800000-CreateActivityLogTables.ts
CREATE TABLE "system_alerts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamptz NOT NULL DEFAULT now(), "type" varchar(30) NOT NULL, "title" varchar(255) NOT NULL, "description" text, "severity" varchar(20) NOT NULL, "metadata" jsonb, "is_read" boolean NOT NULL DEFAULT false, "expires_at" timestamptz, CONSTRAINT "PK_system_alerts" PRIMARY KEY ("id"));

-- 1790938800000-CreateActivityLogTables.ts
CREATE INDEX "IDX_system_alerts_recent" ON "system_alerts" ("is_read", "created_at");

-- 1790938800000-CreateActivityLogTables.ts
CREATE TABLE "transaction_processing_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamptz NOT NULL DEFAULT now(), "transaction_id" uuid NOT NULL, "status" varchar(50) NOT NULL, "title" varchar(255) NOT NULL, "description" text, "metadata" jsonb, CONSTRAINT "PK_transaction_processing_logs" PRIMARY KEY ("id"), CONSTRAINT "FK_transaction_processing_logs_transaction_id" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT);

-- 1790938800000-CreateActivityLogTables.ts
CREATE INDEX "IDX_transaction_processing_logs_recent" ON "transaction_processing_logs" ("transaction_id", "created_at");

-- 1790938800000-CreateActivityLogTables.ts
CREATE TABLE "booking_lifecycle_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamptz NOT NULL DEFAULT now(), "booking_id" uuid NOT NULL, "event_type" varchar(50) NOT NULL, "title" varchar(255) NOT NULL, "description" text, "performed_by" uuid, "metadata" jsonb, CONSTRAINT "PK_booking_lifecycle_logs" PRIMARY KEY ("id"), CONSTRAINT "FK_booking_lifecycle_logs_booking_id" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT, CONSTRAINT "FK_booking_lifecycle_logs_performed_by" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE RESTRICT);

-- 1790938800000-CreateActivityLogTables.ts
CREATE INDEX "IDX_booking_lifecycle_logs_recent" ON "booking_lifecycle_logs" ("booking_id", "created_at");

COMMIT;
