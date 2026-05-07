import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

type ErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: {
    timestamp: string;
    path: string;
  };
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      const { code, message, details } = this.parseHttpException(
        payload,
        status,
      );
      response
        .status(status)
        .json(this.buildBody(request.url, code, message, details));
      return;
    }

    const message =
      exception instanceof Error ? exception.message : 'Internal server error';
    this.logger.error(
      message,
      exception instanceof Error ? exception.stack : undefined,
    );
    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(
        this.buildBody(
          request.url,
          'INTERNAL_SERVER_ERROR',
          'Unexpected server error.',
        ),
      );
  }

  private parseHttpException(
    payload: string | object,
    status: number,
  ): { code: string; message: string; details?: unknown } {
    const code = this.statusToCode(status);

    if (typeof payload === 'string') {
      return { code, message: payload };
    }

    const obj = payload as { message?: unknown; error?: unknown };
    if (Array.isArray(obj.message)) {
      return { code, message: 'Validation failed.', details: obj.message };
    }

    return {
      code,
      message:
        typeof obj.message === 'string'
          ? obj.message
          : typeof obj.error === 'string'
            ? obj.error
            : 'Request failed.',
    };
  }

  private statusToCode(status: number): string {
    if (status === 400) return 'BAD_REQUEST';
    if (status === 401) return 'UNAUTHORIZED';
    if (status === 403) return 'FORBIDDEN';
    if (status === 404) return 'NOT_FOUND';
    if (status === 409) return 'CONFLICT';
    if (status === 422) return 'UNPROCESSABLE_ENTITY';
    return 'HTTP_ERROR';
  }

  private buildBody(
    path: string,
    code: string,
    message: string,
    details?: unknown,
  ): ErrorBody {
    return {
      success: false,
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {}),
      },
      meta: {
        timestamp: new Date().toISOString(),
        path,
      },
    };
  }
}
