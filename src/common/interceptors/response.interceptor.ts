import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RESPONSE_MESSAGE_KEY } from '../decorators';
import { Response } from 'express';
import { Observable, map } from 'rxjs';
import {
  MessageResponse,
  PaginatedData,
  PaginatedResponse,
  SuccessResponse,
} from '../types';

type ResponseData<T> = PaginatedData<T> | T | undefined;

/**
 * Checks whether the returned value is a paginated payload.
 * A paginated payload has the shape: { data: T[], meta: PaginationMeta }
 */
function isPaginatedData<T>(value: unknown): value is PaginatedData<T> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  if (!Array.isArray(obj.data)) return false;

  const meta = obj.meta;
  if (typeof meta !== 'object' || meta === null || Array.isArray(meta)) {
    return false;
  }

  const m = meta as Record<string, unknown>;
  return (
    typeof m.page === 'number' &&
    typeof m.limit === 'number' &&
    typeof m.total === 'number' &&
    typeof m.totalPages === 'number'
  );
}

/**
 * Global response interceptor that wraps all successful controller responses
 * into a unified structure, automatically detecting paginated vs non-paginated
 * payloads.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  ResponseData<T>,
  MessageResponse | SuccessResponse<T> | PaginatedResponse<T>
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<ResponseData<T>>,
  ): Observable<MessageResponse | SuccessResponse<T> | PaginatedResponse<T>> {
    const httpResponse = context.switchToHttp().getResponse<Response>();

    const message =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'Success';

    return next.handle().pipe(
      map((data) => {
        const statusCode = httpResponse.statusCode;

        if (data === undefined) {
          return { statusCode, message };
        }

        // Paginated response: flatten data + meta to the top level
        if (isPaginatedData<T>(data)) {
          const paginated: PaginatedResponse<T> = {
            statusCode,
            message,
            data: data.data,
            meta: data.meta,
          };
          return paginated;
        }

        // Standard response (object, array, primitive, null)
        const standard: SuccessResponse<T> = {
          statusCode,
          message,
          data: data,
        };
        return standard;
      }),
    );
  }
}
