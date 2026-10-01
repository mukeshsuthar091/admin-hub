import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verify } from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types/authenticated-request.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const token = authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];

    if (!token) {
      throw new UnauthorizedException('Bearer token is required');
    }

    const secret = this.configService.getOrThrow<string>(
      'app.jwt.accessSecret',
    );

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

      request.user = { user_id: payload.user_id, role: payload.role };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
