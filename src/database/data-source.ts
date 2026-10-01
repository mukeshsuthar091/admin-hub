import 'reflect-metadata';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { join } from 'node:path';
import { getDatabaseOptions } from '../configs/db.config';
import { validate } from '../configs/validation.config';

async function createDataSource(): Promise<DataSource> {
  await ConfigModule.forRoot({ envFilePath: '.env', validate });

  return new DataSource({
    ...getDatabaseOptions(),
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  });
}

export default createDataSource();
