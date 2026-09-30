import { ClassConstructor, plainToInstance, Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
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
  @IsNumber()
  @IsOptional()
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
  @IsNumber()
  DB_PORT: number = 5432;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  DB_POOL_MAX: number = 20;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  DB_POOL_MIN: number = 2;


  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET: string;

  @IsString()
  @IsNotEmpty()
  ACCESS_TOKEN_EXPIRES: string;

  @IsString()
  @IsNotEmpty()
  REFRESH_TOKEN_EXPIRES: string;

  @IsString()
  @IsNotEmpty()
  FRONTEND_URL: string;

  @Type(() => Number)
  @IsNumber()
  SALT_ROUNDS: number = 10;
}

/**
 * Standard validate function for NestJS ConfigModule.forRoot({ validate })
 */
export function validate(config: Record<string, unknown>): EnvironmentVariables {
  return validateConfig(EnvironmentVariables, config);
}

export const configValidationSchema = validate;
