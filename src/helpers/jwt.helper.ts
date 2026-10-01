import { UnauthorizedException } from '@nestjs/common';
import jwt, { SignOptions } from 'jsonwebtoken';
import { JwtPayload } from '../common/types';

function generateToken(
  payload: JwtPayload,
  secret: string | undefined,
  expiresIn: string | undefined,
): string {
  if (!secret || !expiresIn) {
    throw new Error('JWT secret and expiry must be configured');
  }

  return jwt.sign({ user_id: payload.user_id, role: payload.role }, secret, {
    algorithm: 'HS256',
    expiresIn: expiresIn as SignOptions['expiresIn'],
  });
}

function verifyToken(token: string, secret: string | undefined): JwtPayload {
  if (!secret) {
    throw new Error('JWT secret must be configured');
  }

  try {
    const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });

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

    return { user_id: payload.user_id, role: payload.role };
  } catch {
    throw new UnauthorizedException('Invalid or expired token');
  }
}

export function generateAccessToken(payload: JwtPayload): string {
  return generateToken(
    payload,
    process.env.JWT_ACCESS_SECRET,
    process.env.ACCESS_TOKEN_EXPIRES,
  );
}

export function generateRefreshToken(payload: JwtPayload): string {
  return generateToken(
    payload,
    process.env.JWT_REFRESH_SECRET,
    process.env.REFRESH_TOKEN_EXPIRES,
  );
}

export function verifyAccessToken(token: string): JwtPayload {
  return verifyToken(token, process.env.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token: string): JwtPayload {
  return verifyToken(token, process.env.JWT_REFRESH_SECRET);
}
