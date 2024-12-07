import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Express } from 'express';
import express from 'express';

const server: Express = express();
let app: any;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
      { 
        cors: true,
        logger: ['error', 'warn', 'log'] // Add logging for better debugging
      }
    );

    // Error handling middleware
    server.use((err: any, req: any, res: any, next: any) => {
      console.error(err);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: err.message 
      });
    });

    // Validation pipe with error handling
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      errorHttpStatusCode: 422,
    }));

    // Swagger setup
    const config = new DocumentBuilder()
      .setTitle('Employee Management API')
      .setDescription('API Documentation for Employee Management System')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    // CORS configuration
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      allowedHeaders: 'Content-Type, Accept, Authorization',
    });

    await app.init();
  }

  return app;
}

export default async function handler(req: any, res: any) {
  try {
    const app = await bootstrap();
    server(req, res);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 