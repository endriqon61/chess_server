import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {cors: {
  "origin": "http://localhost:5173",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": true,
  "credentials": true
  // "optionsSuccessStatus": 204
}});
  await app.listen(3000);
}
bootstrap();
