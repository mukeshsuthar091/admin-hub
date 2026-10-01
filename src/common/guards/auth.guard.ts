import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { isUUID } from 'class-validator';
import { User } from '../../modules/users/entities/user.entity';
import { UserStatus } from '../enums';
import { verify } from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types/authenticated-request.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const token = authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];

    if (!token) {
      throw new UnauthorizedException('Bearer token is required');
    }

    const secret = this.configService.getOrThrow<string>(
      'app.jwt.accessSecret',
    );

    let authenticatedUser: { user_id: string; role: string };
    try {
      const payload = verify(token, secret, { algorithms: ['HS256'] });

      if (
        typeof payload === 'string' ||
        typeof payload.user_id !== 'string' ||
        !payload.user_id ||
        typeof payload.role !== 'string' ||
        !payload.role ||
        typeof payload.exp !== 'number'
      ) {
        throw new UnauthorizedException('Invalid token payload');
      }

      if (!isUUID(payload.user_id)) {
        throw new UnauthorizedException('Invalid user ID in access token');
      }
      authenticatedUser = { user_id: payload.user_id, role: payload.role };
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    const user = await this.dataSource.getRepository(User).findOne({
      where: {
        id: authenticatedUser.user_id,
        isDelete: false,
        status: UserStatus.ACTIVE,
      },
      relations: { role: true },
      select: { id: true, role: { name: true, isDelete: true } },
    });
    if (!user || !user.role || user.role.isDelete) {
      throw new UnauthorizedException(
        'User account is unavailable or disabled',
      );
    }
    request.user = { user_id: user.id, role: user.role.name };
    return true;
  }
}
