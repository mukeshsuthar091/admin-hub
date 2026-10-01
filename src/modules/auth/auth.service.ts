import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { compare } from 'bcrypt';
import { isUUID } from 'class-validator';
import { UserProfileDto } from './dto/user-profile.dto';
import { AuthRepository } from './repositories/auth.repository';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../../helpers/jwt.helper';
import { UserStatus } from '../../common/enums';
import { ERROR_MESSAGES } from '../../common/constants';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async getMe(userId: string, role: string): Promise<UserProfileDto> {
    if (!isUUID(userId)) {
      throw new UnauthorizedException('Invalid user ID in access token');
    }

    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException(ERROR_MESSAGES.AUTH.ACCOUNT_DISABLED);
    }

    return {
      id: user.id,
      role,
      userCode: user.userCode,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      dob: user.dob,
      avatarUrl: user.avatarUrl,
      address: user.address,
      city: user.city,
      state: user.state,
      country: user.country,
      status: user.status,
      isDelete: user.isDelete,
      lastActiveAt: user.lastActiveAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async login(
    dto: LoginDto,
    ipAddress: string | null,
  ): Promise<LoginResponseDto> {
    const user = await this.authRepository.findUserByEmail(dto.email);

    if (!user || !(await compare(dto.password, user.password))) {
      throw new UnauthorizedException(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    if (user.status !== UserStatus.ACTIVE || !user.role || user.role.isDelete) {
      throw new ForbiddenException(ERROR_MESSAGES.AUTH.ACCOUNT_DISABLED);
    }

    const payload = { user_id: user.id, role: user.role.name };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await this.authRepository.saveSession({
      userId: user.id,
      accessToken,
      refreshToken,
      deviceToken: dto.device_token || '',
      ipAddress: ipAddress || '',
    });

    return {
      accessToken,
      refreshToken: refreshToken,
    };
  }
}
