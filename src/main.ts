import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from './configs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  app.use(urlencoded({ extended: true, limit: '1mb' }));
  app.use(json({ limit: '1mb' }));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableShutdownHooks(); // Graceful Shutdown
  app.enableCors({
    origin: configService.getOrThrow<string>('app.frontendUrl'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP verbs
    allowedHeaders: 'Content-Type, Authorization', // Allowed custom headers
    credentials: true,
  });
  app.use(helmet());
  app.setGlobalPrefix('/api');

  // Setup Swagger API Documentation
  setupSwagger(app);

  const port = configService.getOrThrow<number>('app.port');
  await app.listen(port);
  logger.log(`Server is running on PORT ${port}`);
  logger.log(
    `Swagger documentation is available at http://localhost:${port}/api/docs`,
  );
}
bootstrap().catch((error: unknown) => {
  const logger = new Logger('Bootstrap');
  logger.error(
    'Failed to start the application',
    error instanceof Error ? error.stack : String(error),
  );
  process.exitCode = 1;
});
