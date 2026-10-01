import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../types';

@Injectable()
export class UserManagementGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest<AuthenticatedRequest>().user;
    if (!user || !['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
      throw new ForbiddenException(
        'Only admins can create users or perform bulk updates',
      );
    }
    return true;
  }
}
