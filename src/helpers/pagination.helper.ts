import { BadRequestException } from '@nestjs/common';
import { PaginationMeta } from '../common/types';

export function calculatePagination(
  page?: string | number,
  limit?: string | number,
): { page: number; limit: number; offset: number } {
  let parsedPage = Number(page);
  let parsedLimit = Number(limit);

  if (!Number.isSafeInteger(parsedPage) || parsedPage <= 0) {
    parsedPage = 1;
  }

  if (!Number.isSafeInteger(parsedLimit) || parsedLimit <= 0) {
    parsedLimit = 10;
  }

  const offset = (parsedPage - 1) * parsedLimit;

  return { page: parsedPage, limit: parsedLimit, offset };
}

export function generatePaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  if (!Number.isSafeInteger(page) || page < 1) {
    throw new BadRequestException('Page must be a positive integer');
  }

  if (!Number.isSafeInteger(limit) || limit < 1) {
    throw new BadRequestException('Limit must be a positive integer');
  }

  if (!Number.isSafeInteger(total) || total < 0) {
    throw new Error('Total must be a non-negative integer');
  }

  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}
