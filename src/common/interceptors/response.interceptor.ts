import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable, map } from 'rxjs';
import {
  PaginatedData,
  PaginatedResponse,
  PaginationMeta,
  SuccessResponse,
} from '../types';

type ResponseData<T> = PaginatedData<T> | T;

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
export class ResponseInterceptor<T>
  implements NestInterceptor<ResponseData<T>, SuccessResponse<T> | PaginatedResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<ResponseData<T>>,
  ): Observable<SuccessResponse<T> | PaginatedResponse<T>> {
    const httpResponse = context
      .switchToHttp()
      .getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        const statusCode = httpResponse.statusCode;

        // Paginated response: flatten data + meta to the top level
        if (isPaginatedData<T>(data)) {
          const paginated: PaginatedResponse<T> = {
            statusCode,
            message: 'Success',
            data: data.data,
            meta: data.meta as PaginationMeta,
          };
          return paginated;
        }

        // Standard response (object, array, primitive, null)
        const standard: SuccessResponse<T> = {
          statusCode,
          message: 'Success',
          data: data as T,
        };
        return standard;
      }),
    );
  }
}
