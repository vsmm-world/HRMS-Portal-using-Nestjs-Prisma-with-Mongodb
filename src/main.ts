import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  
  // Remove the global prefix for now
  // app.setGlobalPrefix('api');
  
  await app.listen(process.env.PORT || 3000);
}

bootstrap();

