import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const mapped = this.mapError(exception);
    response.status(mapped.status).json({
      success: false,
      error: {
        code: mapped.code,
        message: mapped.message,
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    });
  }

  private mapError(exception: Prisma.PrismaClientKnownRequestError): {
    status: number;
    code: string;
    message: string;
  } {
    switch (exception.code) {
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          code: 'UNIQUE_CONSTRAINT_VIOLATION',
          message: 'Data already exists and must be unique.',
        };
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          code: 'RECORD_NOT_FOUND',
          message: 'Requested record does not exist.',
        };
      case 'P2003':
        return {
          status: HttpStatus.CONFLICT,
          code: 'FOREIGN_KEY_CONSTRAINT_VIOLATION',
          message: 'Operation violates related data constraints.',
        };
      default:
        return {
          status: HttpStatus.BAD_REQUEST,
          code: 'PRISMA_ERROR',
          message: 'Database operation failed.',
        };
    }
  }
}
