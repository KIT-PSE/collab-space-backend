import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common';
import { catchError, Observable } from 'rxjs';
import { NotFoundError } from '@mikro-orm/core';

/**
 * This interceptor catches any NotFoundError thrown by MikroORM and
 * rethrows it as a NotFoundException.
 */
@Injectable()
export class NotFoundInterceptor implements NestInterceptor {
  /**
   * Intercepts the incoming observable stream of data.
   * @param context - The execution context.
   * @param next - The next handler in the chain.
   * @returns An observable stream of data.
   * @throws NotFoundException if a NotFoundError is caught.
   * @throws Any other error that is not a NotFoundError.
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        if (err instanceof NotFoundError) {
          throw new NotFoundException();
        }

        throw err;
      }),
    );
  }
}
