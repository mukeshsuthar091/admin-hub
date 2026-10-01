import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import {
  UserRoleFilter,
  UserStatusFilter,
  UserSortBy,
  UserSortOrder,
} from '../type/user-query.enum';

export class ListUsersQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000000)
  page: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @ApiPropertyOptional({ description: 'Case-insensitive name or email search' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(150)
  search?: string;

  @ApiPropertyOptional({
    enum: UserRoleFilter,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsEnum(UserRoleFilter)
  role?: UserRoleFilter;

  @ApiPropertyOptional({ enum: UserStatusFilter })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEnum(UserStatusFilter)
  status?: UserStatusFilter;

  @ApiPropertyOptional({
    enum: UserSortBy,
    default: UserSortBy.DATE_JOINED,
    description: 'createdAt corresponds to Date Joined',
  })
  @IsEnum(UserSortBy)
  sortBy: UserSortBy = UserSortBy.DATE_JOINED;

  @ApiPropertyOptional({
    enum: UserSortOrder,
    description: 'Defaults to DESC for Date Joined, ASC for Name',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(UserSortOrder)
  sortOrder?: UserSortOrder;
}
