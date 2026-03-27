import "reflect-metadata";
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { http } from "./core/config";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ // Включаем валидацию входящих дтошек
    whitelist: true, // убирать все неизвестные пропсы во входящих дтошках
  }));
  await app.listen(http.port);
}
bootstrap();
