export interface TokenSession {
  userId: string;
  accessToken: string;
  refreshToken: string;
  deviceToken: string;
  ipAddress: string | null;
}
