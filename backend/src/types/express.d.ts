/**
 * Express Type Extensions
 * =======================
 * Extend Express types to include custom properties added by middleware.
 *
 * The 'declare global' pattern tells TypeScript to merge these definitions
 * with the existing Express types from @types/express.
 *
 * @see https://www.typescriptlang.org/docs/handbook/declaration-merging.html
 */

import { AuthenticatedUser } from '@common/api.types';

declare global {
  namespace Express {
    /**
     * Extended Request interface
     * AuthMiddleware adds these properties after validating the user
     */
    interface Request {
      /**
       * Authenticated user information from Supabase
       * Populated by AuthMiddleware after token verification
       */
      user?: AuthenticatedUser;

      /**
       * Google OAuth access token
       * Used to make YouTube API calls on behalf of the user
       * Auto-refreshed by AuthMiddleware if expiring soon
       */
      googleAccessToken?: string;

      /**
       * Google OAuth refresh token
       * Used to obtain new access tokens when they expire
       */
      googleRefreshToken?: string;
    }
  }
}

// This export is required for TypeScript module augmentation
export {};
