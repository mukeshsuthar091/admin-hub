import {
  Body,
  Controller,
  Get,
  UseGuards,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '../../common/guards';
import type { AuthenticatedRequest } from '../../common/types';
import { UserProfileDto, UserProfileResponseDto } from './dto/user-profile.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import {
  LoginResponseDto,
  LoginSuccessResponseDto,
} from './dto/login-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Fetch the current user profile from the database' })
  @ApiOkResponse({ type: UserProfileResponseDto })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid or expired access token',
  })
  @ApiForbiddenResponse({ description: 'User or role is disabled' })
  @ApiNotFoundResponse({ description: 'User no longer exists or is deleted' })
  getMe(@Req() request: AuthenticatedRequest): Promise<UserProfileDto> {
    if (!request.user) {
      throw new UnauthorizedException('Authentication is required');
    }

    const { user_id, role } = request.user;
    return this.authService.getMe(user_id, role);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiOkResponse({ type: LoginSuccessResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid request fields' })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  @ApiForbiddenResponse({ description: 'User or role is disabled' })
  @ApiResponse({ status: 429, description: 'Too many login attempts' })
  login(
    @Body() dto: LoginDto,
    @Req() request: Request,
  ): Promise<LoginResponseDto> {
    return this.authService.login(dto, request.ip ?? null);
  }
}
