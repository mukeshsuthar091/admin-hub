import { registerAs } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

export function getDatabaseOptions(): DataSourceOptions {
  return {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: ['development', 'local'].includes(process.env.NODE_ENV || 'local'),
    ssl:
      process.env.DB_SSL === 'true'
        ? {
            rejectUnauthorized: true,
            ...(process.env.DB_SSL_CA
              ? { ca: process.env.DB_SSL_CA.replace(/\\n/g, '\n') }
              : {}),
          }
        : false,
    extra: {
      max: Number(process.env.DB_POOL_MAX || 20),
      min: Number(process.env.DB_POOL_MIN ?? 2),
      idleTimeoutMillis: Number(process.env.DB_POOL_IDLE_TIMEOUT || 30000),
      connectionTimeoutMillis: Number(process.env.DB_POOL_CONN_TIMEOUT || 2000),
    },
  };
}

export default registerAs('database', () => ({
  ...getDatabaseOptions(),
  autoLoadEntities: true,
}));
