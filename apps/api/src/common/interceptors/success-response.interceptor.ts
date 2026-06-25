import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Request } from 'express';

type SuccessEnvelope<T> = {
  success: true;
  data: T;
  meta: {
    timestamp: string;
    path: string;
  };
};

@Injectable()
export class SuccessResponseInterceptor<T> implements NestInterceptor<
  T,
  SuccessEnvelope<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SuccessEnvelope<T>> {
    const req = context.switchToHttp().getRequest<Request>();
    const path = req.path ?? '';

    if (path === '/auth/google' || path === '/auth/google/callback') {
      return next.handle() as unknown as Observable<SuccessEnvelope<T>>;
    }

    const timestamp = new Date().toISOString();

    return next.handle().pipe(
      map((data) => {
        // Keep backward compatibility for handlers already returning { success, data }.
        if (
          typeof data === 'object' &&
          data !== null &&
          'success' in (data as object) &&
          (data as { success?: unknown }).success === true
        ) {
          const existing = data as unknown as {
            success: true;
            data: unknown;
            meta?: unknown;
          };
          return {
            success: true,
            data: existing.data as T,
            meta: {
              timestamp,
              path,
            },
          };
        }

        return {
          success: true,
          data,
          meta: {
            timestamp,
            path,
          },
        };
      }),
    );
  }
}
