import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import {
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { useContainer } from 'class-validator';
import { NotFoundInterceptor } from './common/not-found.interceptor';

/**
 * Bootstrap function to initialize the NestJS application.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS in development environment
  if (process.env.NODE_ENV === 'development') {
    app.enableCors({
      origin: [process.env.FRONTEND_URL],
      credentials: true,
    });
  }

  // Set global prefix for API routes
  app.setGlobalPrefix('api/v1');

  // Configure cookie parser middleware
  app.use(cookieParser(process.env.COOKIE_PARSER_SECRET));

  // Configure global validation pipe
  app.useGlobalPipes(new ValidationPipe({ exceptionFactory }));

  // Attach global interceptor for handling not found errors
  app.useGlobalInterceptors(new NotFoundInterceptor());

  // Enable shutdown hooks for graceful shutdown
  app.enableShutdownHooks();

  // allows us to use NestJS DI in class-validator custom decorators
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(process.env.PORT || 3000);
}

bootstrap();

/**
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
