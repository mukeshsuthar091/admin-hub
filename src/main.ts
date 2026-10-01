import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './configs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.use(json({ limit: '50mb' }));
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  app.enableShutdownHooks(); // Graceful Shutdown
  app.enableCors({
    origin: ['https://example.com', 'http://localhost:3000'], // Allowed domains
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP verbs
    allowedHeaders: 'Content-Type, Authorization', // Allowed custom headers
    credentials: true,
  });
  app.use(helmet());
  app.setGlobalPrefix('/api');

  // Setup Swagger API Documentation
  setupSwagger(app);

  const PORT = process.env.PORT ?? 3000;
  await app.listen(PORT);
  console.log(`Server is running on PORT ${PORT}`);
  console.log(`Swagger documentation is available at http://localhost:${PORT}/api/docs`);
}
bootstrap();
