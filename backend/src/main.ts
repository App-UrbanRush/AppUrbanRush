import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { SERVER_PORT } from './config/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // Configuración de Swagger
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
  
  // La ruta para ver la documentación será http://localhost:PORT/api
  SwaggerModule.setup('api', app, document);

  // 2. Pipes Globales para validación de DTOs
  app.useGlobalPipes(new ValidationPipe({ 
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  const configService = app.get(ConfigService);
  const port = +(configService.get<number>(SERVER_PORT) ?? 3000);

  await app.listen(port);
  //console.log(`UrbanRush corriendo en: http://localhost:${port}/api`);
}
bootstrap();