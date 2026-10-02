# AdminHub Backend

Backend for the AdminHub dashboard, built with NestJS, TypeORM and PostgreSQL. It covers authentication, users, bookings, transactions, refunds, dashboard statistics and revenue charts. Detail endpoints also return activity, processing and lifecycle logs.

Repository: [mukeshsuthar091/admin-hub](https://github.com/mukeshsuthar091/admin-hub).

## Setup

The project was checked with Node.js **20.19.5** and npm **10.8.2**. You also need a running PostgreSQL instance and permission to create the `uuid-ossp` extension.

```bash
git clone https://github.com/mukeshsuthar091/admin-hub.git
cd admin-hub
npm ci
cp .env.example .env
```

Create an empty database named `admin_hub`, or choose another name in `.env`. Set your PostgreSQL connection details, frontend origin and two separate JWT secrets before continuing.

```bash
npm run migration:run
npm run seed
npm run start:dev
```

Run migrations before seeding or starting the application. The default API URL is `http://localhost:8000/api`.

## Environment variables

Copy `.env.example` rather than creating the file from scratch.

| Variable | Description | Default |
| --- | --- | --- |
| `NODE_ENV` | `local`, `development`, `test` or `production` | `local` |
| `PORT` | HTTP port | `8000` |
| `FRONTEND_URL` | Allowed frontend origin, without a trailing slash or path | Required |
| `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | PostgreSQL connection details | Required |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_SSL` | Enable verified database SSL with `true` | `false` |
| `DB_SSL_CA` | Optional PEM CA certificate; literal `\n` is supported | Unset |
| `DB_POOL_MAX`, `DB_POOL_MIN` | Connection pool limits; minimum must not exceed maximum | `20`, `2` |
| `DB_POOL_IDLE_TIMEOUT` | Idle timeout in milliseconds | `30000` |
| `DB_POOL_CONN_TIMEOUT` | Connection timeout in milliseconds | `2000` |
| `JWT_ACCESS_SECRET` | Access-token signing secret | Required |
| `JWT_REFRESH_SECRET` | Separate refresh-token signing secret | Required |
| `ACCESS_TOKEN_EXPIRES` | Positive duration, such as `15m` | Required; example `15m` |
| `REFRESH_TOKEN_EXPIRES` | Positive duration, such as `7d` | Required; example `7d` |
| `SALT_ROUNDS` | bcrypt cost, from 4 to 31 | `10` |
| `APP_TIMEZONE` | Timezone for calendar statistics and charts | `UTC` |

Use `Asia/Kolkata` for Indian calendar boundaries if needed. Keep `.env` and real credentials out of the repository. SSL uses certificate verification; provide the CA when your database provider requires one.

## Running the application

```bash
# Development with reload
npm run start:dev

# Build and run the compiled application
npm run build
npm run start:prod
```

For a deployment using compiled files, apply migrations before starting:

```bash
npm run build
node node_modules/typeorm/cli.js migration:run -d dist/database/data-source.js
npm run start:prod
```

The build must include the compiled migration files. Keep development seed data out of a production database.

## Migrations

TypeORM schema synchronization is disabled. The migrations create the tables, enum types, indexes, constraints and code sequences.

```bash
npm run migration:show
npm run migration:run
```

After changing an entity, generate a new migration against your development database and review its SQL:

```bash
npm run migration:generate -- src/database/migrations/DescribeTheChange
```

To revert the last applied migration:

```bash
npm run migration:revert
```

Reverting a table-creation migration removes its data. The refund migration cannot restore the original positive-only amount constraint while negative refund records remain. Use a disposable development database for rollback checks.

## Seed data and test credentials

```bash
npm run seed
```

Seeds run in this order: roles → super admin → sample users → bookings → transactions → alerts and logs.

| Account | Email | Password | Role |
| --- | --- | --- | --- |
| Initial admin | `admin@adminhub.com` | `Admin@123` | `SUPER_ADMIN` |
| Sample users | `seed.user001@adminhub.com` through `seed.user074@adminhub.com` | `User@123` | Varies |

The seed creates 4 roles, 75 users including the admin, 50 bookings and 60 transactions, plus sample alerts and logs. Some sample users are inactive or suspended and cannot log in. Passwords are bcrypt hashes in the database.

Seeds can be rerun without duplicating their sample records. Existing records are preserved, so counts may be higher on a database that already contains data. An existing admin email is skipped: seeding does not reset its password or role.

These credentials are for local testing. There are no external payment gateway requests during seeding.

## API documentation

| Deliverable | Location |
| --- | --- |
| Swagger UI | [http://localhost:8000/api/docs](http://localhost:8000/api/docs) |
| Live OpenAPI JSON | [http://localhost:8000/api/docs-json](http://localhost:8000/api/docs-json) |
| PostgreSQL schema and ER diagram | [docs/schema.md](docs/schema.md) |
| Fresh-database SQL reference | [docs/schema.sql](docs/schema.sql) |

URLs above require the local server to be running. No hosted backend URL is configured in this repository.

In Swagger, call `POST /api/auth/login` with the test admin credentials. Copy `data.accessToken` into **Authorize**, then call a protected endpoint. Login returns `accessToken` and `refreshToken`; use `GET /api/auth/me` for the user profile.


## Project structure

```text
src/
  common/       guards, filters, interceptors, shared entities and types
  configs/      application, database, environment and Swagger setup
  database/     TypeORM DataSource, migrations and seeds
  helpers/      JWT, password hashing, codes and pagination
  modules/
    auth/       login, current profile and token sessions
    users/      user management and activity log retrieval
    bookings/   booking management and lifecycle log retrieval
    transactions/ transaction management, refunds and processing history
    dashboard/  statistics, charts and alerts
```

Controllers handle HTTP inputs, services handle business rules, and repositories handle database queries. DTOs validate inputs and document responses. Success responses use `{statusCode, message, data}`; paginated responses include top-level `meta`. Operations with no data return `{statusCode, message}`.

## Checks and current scope

```bash
npm run build
npm test -- --runInBand
npx eslint 'src/**/*.ts'
```

`npm run lint` also applies automatic fixes. The end-to-end test still targets the original starter endpoint and is not a full API test suite.

JWT authentication checks the user's current database status and role. Creating users and bulk user changes additionally require ADMIN or SUPER_ADMIN. Other protected endpoints require an active authenticated account. The application includes Helmet, CORS, request limits, DTO validation and consistent error responses.

Refunds are full **database ledger refunds**, not gateway refunds. Refresh tokens are issued, but a refresh/logout endpoint is not implemented. Logs and alerts currently have seed data and read endpoints; automatic event writers and live monitoring are not present in this checkout. The health endpoint returns a starter message and does not check database readiness.

Dashboard revenue assumes successful payments minus successful refunds. Refunded original payments remain gross payments, and separate refund records are deducted once. Currency conversion is not implemented. Revenue charts use the application timezone: 7D is daily, 1M uses seven-day buckets in the current month, and 3M/6M/1Y use calendar months. Empty periods return zero. Monthly percentage changes compare current and previous calendar-month activity.
