import { Request } from 'express';

/**
 * Extended Express Request with authentication data
 * Used by AuthMiddleware to attach user and token information
 */
export interface AuthenticatedRequest extends Request {
  googleAccessToken?: string;
  googleRefreshToken?: string;
  user?: {
    id: string;
    email: string;
  };
}
