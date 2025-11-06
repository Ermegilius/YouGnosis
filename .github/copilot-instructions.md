---
applyTo: "**"
---

Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

# GitHub Copilot Instructions for YouGnosis Project

## Project Overview

YouGnosis is a full-stack YouTube analytics and optimization platform that helps content creators analyze their channel performance, compare with competitors, and receive SEO recommendations.

## Tech Stack

- **Frontend**: React 18+, TypeScript, Redux Toolkit, React Router, Tailwind CSS, Vite
- **Backend**: Nest.js, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth2
- **APIs**: YouTube Data API v3, YouTube Analytics API

## Project Structure

```
/YouGnosis
  /frontend          # React + Vite frontend
  /backend           # Nest.js backend
  /common            # Shared TypeScript types (supabase.types.ts)
  /.github           # GitHub configuration and Copilot instructions
  .env.development   # Root-level environment variables
```

## Code Style Guidelines

### TypeScript

- Use strict TypeScript configuration
- Prefer interfaces over types for object definitions
- Use explicit return types for functions
- Avoid `any` type; use `unknown` when type is truly unknown
- Use optional chaining and nullish coalescing operators
- Import shared types from `@common/*` path alias

### Frontend (React + Redux)

- Use functional components with hooks
- Implement Redux Toolkit with createSlice and createAsyncThunk
- Follow component structure: `ComponentName/index.tsx`, `ComponentName/types.ts`
- Use React Query for server state management alongside Redux
- Implement proper error boundaries
- **Use Tailwind CSS for all styling**
- Keep components small and focused (single responsibility)
- Use custom hooks pattern (e.g., `useAuth()`) for reusable logic

### Tailwind CSS Guidelines

- Use Tailwind v4 best practices for styling
- Follow mobile-first responsive design with breakpoints: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- Leverage Tailwind's spacing scale (4px increments)

### Backend (Nest.js)

- Follow Nest.js module structure (controllers, services, modules)
- Use dependency injection via constructor
- Implement proper DTOs with class-validator decorators
- Use Guards for authentication and authorization
- Implement proper error handling with custom exceptions
- Use ConfigModule for environment variables with Joi validation
- Use Logger from @nestjs/common for all logging
- Implement OnModuleInit for initialization logic
- Create separate modules for: auth, youtube, analytics, users, seo

### Database & Supabase Implementation

#### Shared Types

- All Supabase database types are generated and stored in `/common/supabase.types.ts`
- Import Database type from `@common/supabase.types` in both frontend and backend
- Use the Database type parameter when creating Supabase clients: `createClient<Database>`

#### Backend Supabase Service Pattern

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@common/supabase.types';

// Two client instances:
// 1. Standard client (respects RLS) - for user-scoped operations
// 2. Admin client (bypasses RLS) - for privileged operations only

private supabaseClient: SupabaseClient<Database>;
private supabaseAdmin: SupabaseClient<Database>;
```

- Always use `SupabaseService.getClient()` for user-scoped operations
- Only use `SupabaseService.getAdminClient()` for administrative tasks
- Never expose admin client or secret keys to frontend
- Implement health checks for database connectivity
- Use dependency injection to access SupabaseService in other modules

#### Frontend Supabase Client Pattern

```typescript
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@common/supabase.types";

export const supabase = createClient<Database>(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      storageKey: "yougnosis-auth",
      flowType: "pkce",
    },
  }
);
```

- Use PKCE flow for enhanced security
- Enable session persistence and auto-refresh
- Store auth state in localStorage with custom storage key
- Validate environment variables before creating client

#### Authentication Context Pattern

- Create `AuthContext` with type definition
- Implement `AuthProvider` component wrapping auth logic
- Use `useAuth()` custom hook to access auth state
- Subscribe to auth state changes with `onAuthStateChange`
- Store session and user state in React context
- Implement `signInWithProvider()` for OAuth flows
- Use `ProtectedRoute` component to guard authenticated routes

#### Row Level Security (RLS)

- Use Prisma or TypeORM for database operations
- Implement proper migrations
- Use Row Level Security (RLS) policies in Supabase
- Standard client respects RLS, admin client bypasses it
- Keep database queries in repository pattern
- Use transactions for multi-step operations

## Project-Specific Guidelines

### Environment Variables

**Required Environment Variables** (stored in root `.env.development`):

**Application:**

- `NODE_ENV` - Environment mode (development/production/test)
- `PORT` - Backend server port (default: 3000)
- `ALLOWED_ORIGINS` - CORS allowed origins (comma-separated)

**Supabase (New API Keys Only):**

- `SUPABASE_PROJECT_ID` - Your Supabase project ID
- `SUPABASE_DB_PASSWORD` - Database password
- `SUPABASE_URL` - Full Supabase project URL (uses ${SUPABASE_PROJECT_ID})
- `SUPABASE_STORAGE_URL` - Storage API URL
- `SUPABASE_PUBLISHABLE_KEY` - Must start with `sb_publishable_`
- `SUPABASE_SECRET_KEY_DEFAULT` - Must start with `sb_secret_` (backend only)

**Frontend (Vite):**

- `VITE_NODE_ENV` - Frontend environment mode
- `VITE_PORT` - Frontend dev server port (default: 8000)
- `VITE_SUPABASE_URL` - References ${SUPABASE_URL}
- `VITE_SUPABASE_PUBLISHABLE_KEY` - References ${SUPABASE_PUBLISHABLE_KEY}
- `VITE_API_URL` - Backend API URL for proxying

**Environment Variable Rules:**

- Store all env vars in root `.env.development` file
- Use variable expansion: `${VARIABLE_NAME}`
- Validate with Joi schema in ConfigModule
- Never commit `.env` files to version control
- Use `import.meta.env.VITE_*` in frontend
- Use `ConfigService` in backend
- Prefix frontend-accessible vars with `VITE_`

### Path Aliases

Both frontend and backend use TypeScript path aliases:

```typescript
"paths": {
  "@common/*": ["../common/*"],
  "@src/*": ["./src/*"]
}
```

- Use `@common/*` to import shared types across frontend/backend
- Use `@src/*` for project-specific imports
- Configure `vite-tsconfig-paths` plugin in Vite
- Configure path resolution in `vite.config.ts`

### Authentication Flow

1. User clicks "Login with Google" on Auth component
2. `signInWithProvider('google')` calls Supabase OAuth
3. User redirects to Google for authentication
4. Google redirects back to app with auth code
5. Supabase exchanges code for session (PKCE flow)
6. `onAuthStateChange` updates context state
7. Session persists in localStorage
8. Protected routes check session state
9. Backend validates tokens via Supabase

### YouTube API Integration

- Implement rate limiting and quota management
- Cache frequently accessed data
- Handle API errors gracefully
- Use batch requests when possible
- Store API credentials in environment variables
- Validate OAuth2 tokens on backend

### Analytics Features

- Fetch and store: views, watch time, retention rates, traffic sources, subscriber growth
- Implement data aggregation for different time periods (7d, 30d, 90d, 1y)
- Use background jobs for data synchronization
- Implement real-time updates where appropriate

### Competitor Comparison

- Only use publicly available YouTube metrics
- Implement fair usage policies
- Cache competitor data to minimize API calls
- Allow users to add/remove competitors

### SEO Recommendations

- Analyze video metadata (title, description, tags)
- Suggest optimal publishing times based on audience analytics
- Provide tag suggestions based on trending topics
- Implement A/B testing suggestions

### Dashboard

- Create reusable chart components using libraries compatible with Tailwind (Chart.js, Recharts)
- Implement responsive design (mobile-first)
- Use Tailwind's animation utilities for loading skeletons
- Implement data export functionality (CSV, PDF)
- Add customizable widgets with Tailwind grid system

## Security Best Practices

- **Never expose secret keys or admin tokens to frontend**
- Use `SUPABASE_PUBLISHABLE_KEY` (sb*publishable*\*) in frontend only
- Use `SUPABASE_SECRET_KEY_DEFAULT` (sb*secret*\*) in backend only
- Validate all user inputs on backend
- Implement CORS properly (configure ALLOWED_ORIGINS)
- Use HTTPS only in production
- Sanitize data before database operations
- Implement rate limiting on API endpoints
- Use Supabase RLS for data access control
- Validate OAuth2 tokens on backend
- Use PKCE flow for OAuth authentication

## File Organization

```
/frontend
  /src
    /components        # Reusable UI components
      /Auth           # Auth component
      /ProtectedRoute # Route guard component
    /context          # React Context providers
      /AuthContext    # Auth context definition
      /AuthProvider   # Auth provider implementation
    /hooks            # Custom React hooks
      /useAuth        # Auth hook
    /lib              # Third-party integrations
      /supabase.ts    # Supabase client setup
    /pages            # Page components
    /router           # Route configuration
    /services         # API calls
    /utils            # Utility functions
    /types            # TypeScript type definitions
  /vite.config.ts     # Vite configuration with proxy

/backend
  /src
    /modules
      /app            # Main application module
      /supabase       # Supabase service module
      /test-data      # Example module with controller/service
      /auth           # (Future) Authentication module
      /youtube        # (Future) YouTube API module
      /analytics      # (Future) Analytics module
      /users          # (Future) User management
      /seo            # (Future) SEO recommendations
    /common           # Shared utilities
  /eslint.config.mjs  # ESLint configuration

/common
  /supabase.types.ts  # Generated Supabase types (shared)

.github
  /copilot-instructions.md  # This file
```

## When Generating Code

1. **Always include proper TypeScript types** from `@common` or local definitions
2. **Add error handling** with try-catch and proper error messages
3. **Include relevant comments** for complex logic
4. **Follow established patterns** from existing code
5. **Use Logger** for all backend logging (`@nestjs/common`)
6. **Validate environment variables** before use
7. **Consider performance implications** (caching, pagination, lazy loading)
8. **Think about scalability** (database indexing, API rate limits)
9. **Implement proper logging** with context and severity levels
10. **Consider accessibility (a11y)** - use proper ARIA labels and semantic HTML
11. **Use path aliases** (`@common`, `@src`) for cleaner imports
12. **Check for existing implementations** before creating new patterns
13. **Always display filename** and path when generating code snippets before the code block
14. **Suggest this instruction refinements** if needed
15. **Format code blocs** with triple backticks and language specifier

## Priority Features for MVP

1. Supabase authentication with Google OAuth2
2. Protected route implementation
3. Auth context and custom hooks
4. Backend Supabase service with dual clients
5. YouTube channel connection via Google OAuth2
6. Basic analytics dashboard (views, subscribers, watch time)
7. Single competitor comparison
8. Basic SEO suggestions (tags, title optimization)
9. Responsive UI for desktop and mobile with Tailwind

## Code Review Checklist

When reviewing or generating code, ensure:

- [ ] TypeScript types are properly defined and imported from `@common` where applicable
- [ ] Error handling is implemented with meaningful messages
- [ ] Environment variables are validated and accessed correctly
- [ ] Supabase clients are used appropriately (client vs admin)
- [ ] Auth state is managed through context/hooks
- [ ] Protected routes use ProtectedRoute component
- [ ] Tailwind classes follow the organization pattern
- [ ] Components follow single responsibility principle
- [ ] API responses follow the standard format
- [ ] Logging uses NestJS Logger with appropriate context
- [ ] Security best practices are followed
- [ ] No secrets or admin keys in frontend code
