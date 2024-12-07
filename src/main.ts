import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('HRMS Portal')
    .setDescription('Completed Tasks')
    .addBearerAuth()
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.init();
  const port = process.env.PORT || 3000;
  await app.listen(port);
  return app;
}

// Export handler for serverless environments
export const handler = async (req, res) => {
  const app = await bootstrap();
  await app.getHttpAdapter().getInstance()(req, res);
};

// Start server if running locally
if (process.env.NODE_ENV !== 'production') {
  bootstrap().then(app => {
    app.listen(process.env.PORT || 3000);
    console.log(`Server running on port ${process.env.PORT || 3000}`);
  });
}

export default bootstrap;

