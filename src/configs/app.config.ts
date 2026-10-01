import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.NODE_ENV || 'local',
  port: parseInt(process.env.PORT || '8000', 10),
  frontendUrl: process.env.FRONTEND_URL,
  saltRounds: parseInt(process.env.SALT_ROUNDS || '10', 10),
  timezone: process.env.APP_TIMEZONE || 'UTC',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpires: process.env.ACCESS_TOKEN_EXPIRES,
    refreshExpires: process.env.REFRESH_TOKEN_EXPIRES,
  },
}));
