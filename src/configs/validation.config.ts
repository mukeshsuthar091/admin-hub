import { ClassConstructor, plainToInstance, Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsInt,
  IsIn,
  IsUrl,
  Matches,
  Min,
  Max,
  IsOptional,
  IsString,
  validateSync,
  ValidatorOptions,
} from 'class-validator';
import { Environment } from '../common';

/**
 * Generic reusable validation function for any class-validator schema.
 * Can be used across all module configurations.
 */
export function validateConfig<T extends object>(
  schemaClass: ClassConstructor<T>,
  config: Record<string, unknown>,
  options?: ValidatorOptions,
): T {
  const validatedConfig = plainToInstance(schemaClass, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
    ...options,
  });

  if (errors.length > 0) {
    const formatErrors = (errs: typeof errors): string => {
      return errs
        .map((err) => {
          const constraints = err.constraints
            ? Object.values(err.constraints).join(', ')
            : '';
          const children =
            err.children && err.children.length > 0
              ? `\n  ${formatErrors(err.children)}`
              : '';
          return `${err.property}: ${constraints}${children}`;
        })
        .join('\n');
    };

    throw new Error(`[Config Validation Error]\n${formatErrors(errors)}`);
  }

  return validatedConfig;
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Local;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(65535)
  PORT: number = 8000;

  @IsString()
  @IsNotEmpty()
  DB_NAME: string;

  @IsString()
  @IsNotEmpty()
  DB_USER: string;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  DB_PORT: number = 5432;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1)
  DB_POOL_MAX: number = 20;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(0)
  DB_POOL_MIN: number = 2;

  @IsIn(['true', 'false'])
  DB_SSL: string = 'false';

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  DB_SSL_CA: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  DB_POOL_IDLE_TIMEOUT: number = 30000;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  DB_POOL_CONN_TIMEOUT: number = 2000;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9]\d*(ms|s|m|h|d|w|y)$/, {
    message:
      'ACCESS_TOKEN_EXPIRES must be a positive duration such as 15m or 7d',
  })
  ACCESS_TOKEN_EXPIRES: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9]\d*(ms|s|m|h|d|w|y)$/, {
    message:
      'REFRESH_TOKEN_EXPIRES must be a positive duration such as 15m or 7d',
  })
  REFRESH_TOKEN_EXPIRES: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl({
    require_tld: false,
    protocols: ['http', 'https'],
    require_protocol: true,
  })
  @Matches(/^https?:\/\/[^/?#]+$/, {
    message:
      'FRONTEND_URL must be an HTTP origin without a path, query or fragment',
  })
  FRONTEND_URL: string;

  @Type(() => Number)
  @IsInt()
  @Min(4)
  @Max(31)
  SALT_ROUNDS: number = 10;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  APP_TIMEZONE: string = 'UTC';
}

/**
 * Standard validate function for NestJS ConfigModule.forRoot({ validate })
 */
export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validated = validateConfig(EnvironmentVariables, config);
  if (validated.DB_POOL_MIN > validated.DB_POOL_MAX) {
    throw new Error(
      '[Config Validation Error] DB_POOL_MIN must not exceed DB_POOL_MAX',
    );
  }
  return validated;
}

export const configValidationSchema = validate;
