import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import session from 'express-session';

import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { SuccessResponseInterceptor } from './common/interceptors/success-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    session({
      secret: process.env.SESSION_SECRET ?? 'lottery-dev-session-change-me',
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: 15 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax',
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidUnknownValues: true,
    }),
  );
  app.useGlobalFilters(
    new PrismaExceptionFilter(),
    new GlobalExceptionFilter(),
  );
  app.useGlobalInterceptors(new SuccessResponseInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Lottery SaaS API')
    .setDescription('API documentation for Lottery SaaS backend')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Input access token as: Bearer <token>',
      },
      'access-token',
    )
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument, {
    swaggerOptions: { persistAuthorization: true },
  });

  const webOrigin = process.env.WEB_APP_ORIGIN ?? 'http://localhost:3000';
  app.enableCors({
    origin: webOrigin
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
