import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseBody } from '../types';

/**
 * Global Exception Filter that catches all HTTP and unhandled exceptions
 * and formats the error response into a unified structure.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status: number =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = 'Internal server error';
    let errorName = 'Internal Server Error';

    if (exception instanceof HttpException && status < 500) {
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        if (typeof resObj.message === 'string') {
          message = resObj.message;
        } else if (
          Array.isArray(resObj.message) &&
          resObj.message.every((item: unknown) => typeof item === 'string')
        ) {
          message = resObj.message;
        } else {
          message = exception.message;
        }
        errorName =
          typeof resObj.error === 'string' ? resObj.error : exception.name;
      } else if (typeof res === 'string') {
        message = res;
        errorName = exception.name;
      }
    }

    const errorResponseBody: ErrorResponseBody = {
      statusCode: status,
      message,
      error: errorName,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} - ${status} - Error: ${
          exception instanceof Error
            ? exception.stack
            : JSON.stringify(exception)
        }`,
      );
    } else {
      this.logger.warn(
        `[${request.method}] ${request.url} - ${status} - Message: ${JSON.stringify(
          message,
        )}`,
      );
    }

    response.status(status).json(errorResponseBody);
  }
}
