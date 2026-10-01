# AdminHub API

NestJS and PostgreSQL backend for the AdminHub assignment, using TypeORM.
The current project contains the shared application setup. Authentication,
dashboard, users, transactions and bookings are still to be implemented.

## Local setup

Use Node.js 20 or newer and a running PostgreSQL server.

```bash
npm ci
cp .env.example .env
```

Create the PostgreSQL database and update `.env` with your connection details.
Replace both JWT secret placeholders with separate random secrets.

```bash
npm run migration:run
npm run start:dev
```

The default port is `8000`. The current endpoint is `GET /api/health`.
Swagger is available at `http://localhost:8000/api/docs`.
The health endpoint currently returns a wrapped starter message; it does not
check database readiness.

## Environment variables

| Variable                                        | Purpose / default                                                                   |
| ----------------------------------------------- | ----------------------------------------------------------------------------------- |
| `NODE_ENV`                                      | `local`, `development`, `test` or `production`; default `local`                     |
| `PORT`                                          | HTTP port; default `8000`                                                           |
| `FRONTEND_URL`                                  | Allowed frontend origin, such as `http://localhost:3000`; no trailing slash or path |
| `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`  | PostgreSQL connection details; required                                             |
| `DB_PORT`                                       | PostgreSQL port; default `5432`                                                     |
| `DB_SSL`                                        | `true` or `false`; default `false`                                                  |
| `DB_SSL_CA`                                     | Optional PEM CA certificate for SSL, with literal `\n` supported                    |
| `DB_POOL_MAX`, `DB_POOL_MIN`                    | Pool limits; defaults `20` and `2`; minimum cannot exceed maximum                   |
| `DB_POOL_IDLE_TIMEOUT`                          | Idle timeout in milliseconds; default `30000`                                       |
| `DB_POOL_CONN_TIMEOUT`                          | Connection timeout in milliseconds; default `2000`                                  |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`       | Required JWT secrets; authentication implementation is pending                      |
| `ACCESS_TOKEN_EXPIRES`, `REFRESH_TOKEN_EXPIRES` | Positive duration with unit `ms`, `s`, `m`, `h`, `d`, `w` or `y`                    |
| `SALT_ROUNDS`                                   | bcrypt cost between `4` and `31`; default `10`                                      |

SSL verifies the database certificate. When the provider uses a private CA,
provide `DB_SSL_CA` rather than disabling certificate verification.
Do not commit `.env` or real credentials.

## Database migrations

Schema synchronization is disabled in every environment. Put entities in files
named `*.entity.ts` and register them through `TypeOrmModule.forFeature()` in their
feature modules. The CLI discovers these files using `src/database/data-source.ts`.

After changing entities, generate and review a migration:

```bash
npm run migration:generate -- src/database/migrations/CreateUsers
npm run migration:show
npm run migration:run
```

The generate command needs a database connection to compare the schema.
There are no entities or schema migrations yet, so generation is useful once
feature entities have been added.

To undo the last applied migration:

```bash
npm run migration:revert
```

For a compiled deployment, run migrations before starting the application:

```bash
npm run build
node node_modules/typeorm/cli.js migration:run -d dist/database/data-source.js
npm run start:prod
```

A seed script, realistic sample data, admin credentials and a schema diagram
will be added with the feature modules.

## Shared setup

- Helmet, environment-based CORS and global rate limiting (100 requests/minute).
- JSON and URL-encoded request bodies limited to 1 MB.
- Global DTO validation that transforms inputs and rejects unknown properties.
- Consistent success responses, including top-level `data` and `meta` for pagination.
- Consistent errors; server errors return a generic message and log details internally.
- HTTP request logging and shutdown hooks.

## Checks

```bash
npm run build
npm test -- --runInBand
npx eslint 'src/**/*.ts'
```

The existing end-to-end test still targets the starter route and response.
It needs updating before it can validate the current application.
