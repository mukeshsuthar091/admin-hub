import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class BulkUpdateUsersDto {
  @ApiProperty({
    type: [String],
    description: 'Unique UUID user IDs; maximum 100',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  user_ids: string[];

  @ApiPropertyOptional({ enum: ['ADMIN', 'VIEWER', 'EDITOR'] })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() || undefined : value,
  )
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsIn(['ADMIN', 'VIEWER', 'EDITOR'])
  role?: string;

  @ApiPropertyOptional({ type: Boolean })
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsBoolean()
  is_suspend?: boolean;
}
