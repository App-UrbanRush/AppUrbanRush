import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { SERVER_PORT } from './config/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // CORS — dominios desde .env (soporta desarrollo y producción)
  const allowedOrigins = (configService.get<string>('CORS_ORIGINS') ?? 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Swagger (solo en desarrollo/staging)
  const nodeEnv = configService.get<string>('NODE_ENV') ?? 'development';
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('UrbanRush API')
      .setDescription('API para la gestión de envíos y directorio en Mocoa')
      .setVersion('1.0')
      .addTag('User', 'Operaciones relacionadas con los usuarios')
      .addTag('Auth', 'Sistema de autenticación y tokens')
      .addTag('Roles', 'Gestión de roles del sistema')
      .addTag('UserRol', 'Relación entre usuarios y roles')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  // Pipes globales
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Confiar en proxy (necesario detrás de Nginx para X-Forwarded-*)
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  const port = +(configService.get<number>(SERVER_PORT) ?? 3000);
  await app.listen(port);
  console.log(`UrbanRush corriendo en puerto ${port} [${nodeEnv}]`);
}
bootstrap();
