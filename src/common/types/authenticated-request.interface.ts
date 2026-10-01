import { Request } from 'express';

export interface AuthenticatedUser {
  user_id: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
