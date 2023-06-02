import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import {
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');
  app.use(cookieParser('secret'));
  app.useGlobalPipes(new ValidationPipe({ exceptionFactory }));

  // allows us to use NestJS DI in class-validator custom decorators
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(3000);
}

bootstrap();

/*
 * The existing factory function returns an array of errors without
 * associating these errors with their respective properties.
 *
 * The updated factory function, defined below, addresses this by appending
 * property names to error messages. This enhancement allows clients to
 * present the error messages in a context-aware manner, thus improving
 * the usability and understandability of the error messages.
 */
function exceptionFactory(errors: ValidationError[]) {
  const messages = errors.map((err) => [
    err.property,
    Object.values(err.constraints).join('. ').trim(),
  ]);

  return new UnprocessableEntityException(messages);
}
