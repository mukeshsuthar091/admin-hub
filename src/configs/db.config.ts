import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    autoLoadEntities: true,
    synchronize:
      process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local',
    logging:
      process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    extra: {
      // Connection Pool Configuration
      max: parseInt(process.env.DB_POOL_MAX || '20', 10),
      min: parseInt(process.env.DB_POOL_MIN || '2', 10),
      idleTimeoutMillis: parseInt(
        process.env.DB_POOL_IDLE_TIMEOUT || '30000',
        10,
      ),
      connectionTimeoutMillis: parseInt(
        process.env.DB_POOL_CONN_TIMEOUT || '2000',
        10,
      ),
    },
  }),
);
