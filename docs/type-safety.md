# Type Safety Guide for YouGnosis

## Overview

This document outlines the type safety architecture for the YouGnosis project, covering shared types, validation patterns, and best practices for maintaining type safety across the full-stack application.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Shared Types (`/common`)](#shared-types-common)
3. [Backend Type System](#backend-type-system)
4. [Frontend Type System](#frontend-type-system)
5. [Type Guards](#type-guards)
6. [Validation Patterns](#validation-patterns)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Directory Structure

```
/YouGnosis
├── /common                        # Shared types (frontend + backend)
│   ├── supabase.types.ts         # Auto-generated database types
│   ├── youtube.types.ts          # YouTube API & OAuth types
│   └── api.types.ts              # API contract types
│
├── /backend/src
│   └── /types                    # Backend-only types
│       ├── express.d.ts          # Express type extensions
│       └── index.ts              # Barrel export
│
└── /frontend/src
    └── /types                    # Frontend-only types
        └── index.ts              # Component & UI types
```

### Type Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    /common Types                        │
│  (Shared between Frontend & Backend)                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │ supabase.types   │  │ youtube.types    │             │
│  │ - Database       │  │ - YouTubeJob     │             │
│  │ - Tables<>       │  │ - ReportType     │             │
│  │ - TablesInsert<> │  │ - GoogleTokens   │             │
│  └──────────────────┘  └──────────────────┘             │
│                                                         │
│  ┌──────────────────────────────────────────┐           │
│  │ api.types                                │           │
│  │ - AuthenticatedUser                      │           │
│  │ - CreateJobRequest                       │           │
│  │ - ApiErrorResponse                       │           │
│  └──────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────┘
                       ▼                    ▼
           ┌───────────────────┐  ┌───────────────────┐
           │ Backend Types     │  │ Frontend Types    │
           ├───────────────────┤  ├───────────────────┤
           │ - express.d.ts    │  │ - LoadingState    │
           │ - Request         │  │ - MenuItem        │
           │   extensions      │  │ - Component props │
           └───────────────────┘  └───────────────────┘
```

---

## Shared Types (`/common`)

### 1. Database Types (`common/supabase.types.ts`)

**Auto-generated** from Supabase schema using the Supabase CLI.

#### Generate Types Command

```bash
npx supabase gen types typescript --project-id vlezvlibttcwbvqylzux > common/supabase.types.ts
```

#### Usage Examples

```typescript
import type { Database, Tables, TablesInsert } from "@common/supabase.types";

// Table row type
type TestTableRow = Tables<"test_table">;

// Insert type (for creating new records)
type TestTableInsert = TablesInsert<"test_table">;

// Database-aware Supabase client
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const client: SupabaseClient<Database> = createClient(url, key);
```

#### Key Types

| Type              | Description                         | Usage                      |
| ----------------- | ----------------------------------- | -------------------------- |
| `Database`        | Complete database schema            | Supabase client type param |
| `Tables<T>`       | Table row type                      | Query result typing        |
| `TablesInsert<T>` | Table insert type (optional fields) | `.insert()` operations     |
| `TablesUpdate<T>` | Table update type (all optional)    | `.update()` operations     |
| `Enums<T>`        | Database enum types                 | Type-safe enum values      |

### 2. YouTube API Types (`common/youtube.types.ts`)

Defines YouTube Reporting API structures and Google OAuth types.

#### YouTube API Types

```typescript
/**
 * YouTube Reporting API - Report Type
 */
export interface YouTubeReportType {
  id: string;
  name: string;
  systemManaged?: boolean;
}

/**
 * YouTube Reporting API - Job
 */
export interface YouTubeJob {
  id: string;
  name: string;
  reportTypeId: string;
  createTime: string;
}

/**
 * YouTube Reporting API - Report
 */
export interface YouTubeReport {
  id: string;
  jobId: string;
  startTime: string;
  endTime: string;
  createTime: string;
  downloadUrl: string;
}
```

#### Google OAuth Types

```typescript
/**
 * Google OAuth2 - Token Response
 */
export interface GoogleTokensResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number; // Seconds until expiration
  scope?: string;
  token_type: string;
}

/**
 * Google OAuth2 - User Info Response
 */
export interface GoogleUserInfoResponse {
  sub: string; // Google user ID
  email: string;
  email_verified: boolean;
  name: string;
  given_name?: string;
  picture?: string;
}

/**
 * Supabase user_metadata for Google OAuth
 */
export interface GoogleProviderMetadata {
  provider: "google";
  provider_id: string;
  provider_token: string;
  provider_refresh_token?: string;
  provider_token_expires_at: number; // Unix timestamp (ms)
  provider_scopes: string;
  name: string;
  given_name?: string;
  picture?: string;
}
```

#### YouTube API Error Types

```typescript
/**
 * YouTube API Error Response
 * Based on Google API error format
 */
export interface YouTubeApiErrorResponse {
  error: YouTubeApiError;
}

export interface YouTubeApiError {
  code?: number; // HTTP status code
  message?: string; // Error message
  status?: string; // Error status (e.g., "PERMISSION_DENIED")
  details?: YouTubeApiErrorDetail[]; // Additional error info
}

/**
 * YouTube API Error Detail
 */
export interface YouTubeApiErrorDetail {
  "@type"?: string; // Type URL
  reason?: string; // Reason code (e.g., "INVALID_REPORT_TYPE")
  domain?: string; // Error domain
  metadata?: Record<string, unknown>; // Additional metadata
}
```

### 3. API Contract Types (`common/api.types.ts`)

Defines request/response types for API endpoints.

#### Authentication Types

```typescript
/**
 * Authenticated user (attached to requests)
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
}

/**
 * OAuth callback query parameters
 */
export interface OAuthCallbackQuery {
  code: string;
  state: string;
  error?: string;
}
```

#### YouTube API Endpoints

```typescript
/**
 * Request body for creating a YouTube job
 */
export interface CreateJobRequest {
  reportTypeId: string;
  name: string;
}

/**
 * Response types
 */
export type CreateJobResponse = YouTubeJob;
export type ReportTypesResponse = YouTubeReportType[];
```

#### Standard Error Response

```typescript
/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
  timestamp?: string;
}
```

---

## Backend Type System

### 1. Express Type Extensions (`backend/src/types/express.d.ts`)

Extends Express Request interface with custom properties.

```typescript
import { AuthenticatedUser } from "@common/api.types";

declare global {
  namespace Express {
    interface Request {
      /**
       * Authenticated user (set by AuthMiddleware)
       */
      user?: AuthenticatedUser;

      /**
       * Google OAuth access token (set by AuthMiddleware)
       */
      googleAccessToken?: string;

      /**
       * Google OAuth refresh token (set by AuthMiddleware)
       */
      googleRefreshToken?: string;
    }
  }
}

export {};
```

#### How It Works

1. **Declaration Merging**: TypeScript merges this interface with the existing Express `Request` type
2. **Global Scope**: Available throughout the backend without imports
3. **Type Safety**: Accessing `req.user` is properly typed everywhere

#### Usage Example

```typescript
import { Request } from "express";

@Get("profile")
async getProfile(@Req() req: Request) {
  // ✅ TypeScript knows req.user is AuthenticatedUser | undefined
  const userId = req.user?.id;

  // ✅ TypeScript knows req.googleAccessToken is string | undefined
  const token = req.googleAccessToken;
}
```

### 2. Backend Barrel Export (`backend/src/types/index.ts`)

Centralized type exports for cleaner imports.

```typescript
// Re-export common types
export type {
  YouTubeReportType,
  YouTubeJob,
  GoogleTokensResponse,
  GoogleProviderMetadata,
  YouTubeApiErrorResponse,
} from "@common/youtube.types";

export {
  isGoogleProviderMetadata,
  isYouTubeApiErrorResponse,
} from "@common/youtube.types";

export type {
  AuthenticatedUser,
  CreateJobRequest,
  ApiErrorResponse,
} from "@common/api.types";

export type { Database } from "@common/supabase.types";
```

#### Benefits

```typescript
// ❌ Before (multiple imports)
import { GoogleProviderMetadata } from "@common/youtube.types";
import { AuthenticatedUser } from "@common/api.types";
import { Database } from "@common/supabase.types";

// ✅ After (single import)
import {
  GoogleProviderMetadata,
  AuthenticatedUser,
  Database,
} from "@src/types";
```

### 3. TypeScript Configuration (`backend/tsconfig.json`)

Key configuration for type safety:

```json
{
  "compilerOptions": {
    "strictNullChecks": true, // Enforce null/undefined checking
    "noImplicitAny": false, // Allow implicit any (can be strict in production)
    "typeRoots": [
      "./node_modules/@types",
      "./src/types" // Include custom type definitions
    ],
    "paths": {
      "@common/*": ["../common/*"], // Shared types
      "@src/*": ["./src/*"] // Backend types
    }
  },
  "include": [
    "src/**/*",
    "src/types/**/*.d.ts", // Include .d.ts files
    "../common/**/*",
    "test/**/*" // Include test files
  ]
}
```

---

## Frontend Type System

### 1. Frontend Types (`frontend/src/types/index.ts`)

Frontend-specific types for components and state.

```typescript
// Re-export common types
export type {
  YouTubeReportType,
  YouTubeJob,
  GoogleProviderMetadata,
} from "@common/youtube.types";

export type {
  AuthenticatedUser,
  CreateJobRequest,
  ApiErrorResponse,
} from "@common/api.types";

// Component-specific types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface MenuItem {
  title: string;
  path: string;
  subMenu?: MenuItem[];
}
```

### 2. Component Prop Types

Always define explicit prop types for components:

```typescript
interface DashboardSectionProps {
  title: string;
  children: ReactNode;
}

function DashboardSection({ title, children }: DashboardSectionProps): ReactNode {
  return (
    <section className="card">
      <h2 className="card-title">{title}</h2>
      {children}
    </section>
  );
}
```

### 3. API Response Typing

Type API responses using common types:

```typescript
import type { YouTubeReportType } from "@src/types";

const fetchReportTypes = async (): Promise<YouTubeReportType[]> => {
  const response = await api.get<YouTubeReportType[]>("/youtube/report-types");
  return response.data;
};
```

---

## Type Guards

Type guards safely narrow unknown types to specific interfaces.

### 1. Google Metadata Type Guard

Used to validate Supabase user metadata.

```typescript
/**
 * Type guard for GoogleProviderMetadata
 */
export function isGoogleProviderMetadata(
  metadata: unknown
): metadata is GoogleProviderMetadata {
  if (!metadata || typeof metadata !== "object") return false;

  const meta = metadata as Record<string, unknown>;

  return (
    meta.provider === "google" &&
    typeof meta.provider_id === "string" &&
    typeof meta.provider_token === "string" &&
    typeof meta.provider_token_expires_at === "number" &&
    typeof meta.provider_scopes === "string" &&
    typeof meta.name === "string"
  );
}
```

#### Usage Example

```typescript
const metadata = user.user_metadata;

// ❌ Unsafe (TypeScript doesn't know the type)
const token = metadata.provider_token; // Error: Property doesn't exist

// ✅ Safe with type guard
if (isGoogleProviderMetadata(metadata)) {
  // TypeScript knows metadata is GoogleProviderMetadata
  const token = metadata.provider_token; // ✅ No error
  const expiresAt = metadata.provider_token_expires_at; // ✅ Typed as number
}
```

### 2. YouTube API Error Type Guard

Used to validate YouTube API error responses.

```typescript
/**
 * Type guard for YouTube API error response
 */
export function isYouTubeApiErrorResponse(
  data: unknown
): data is YouTubeApiErrorResponse {
  if (!data || typeof data !== "object") return false;

  const response = data as Record<string, unknown>;

  if (
    !("error" in response) ||
    typeof response.error !== "object" ||
    response.error === null
  ) {
    return false;
  }

  const error = response.error as Record<string, unknown>;

  return (
    typeof error.message === "string" ||
    typeof error.code === "number" ||
    typeof error.status === "string"
  );
}
```

#### Usage Example

```typescript
try {
  const response = await httpService.get(url);
} catch (error: unknown) {
  if (error instanceof AxiosError) {
    const responseData: unknown = error.response?.data;

    // ✅ Type guard narrows unknown to YouTubeApiErrorResponse
    if (isYouTubeApiErrorResponse(responseData)) {
      // TypeScript knows responseData.error is properly typed
      const message = responseData.error.message;
      const code = responseData.error.code;
      const status = responseData.error.status;

      this.logger.error(`YouTube API error: ${message} (${code})`);
    }
  }
}
```

---

## Validation Patterns

### 1. NestJS DTOs (Request Validation)

Use `Pick<>` utility types instead of separate DTO classes:

```typescript
import { YouTubeJob } from "@common/youtube.types";

// ✅ Simple DTO type (no class needed)
type CreateJobDto = Pick<YouTubeJob, "reportTypeId" | "name">;

@Post("create-job")
async createJob(@Body() dto: CreateJobDto): Promise<YouTubeJob> {
  return this.youtubeService.createJob(dto);
}
```

### 2. Supabase Query Result Typing

Always type Supabase queries:

```typescript
import type { Database, Tables } from "@common/supabase.types";

type TestTableRow = Tables<"test_table">;

async getTestData(): Promise<TestTableRow[]> {
  const supabase = this.supabaseService.getClient();

  const { data, error } = await supabase.from("test_table").select("*");

  if (error) {
    throw new Error(error.message);
  }

  // ✅ Type assertion after error check
  return (data as TestTableRow[]) ?? [];
}
```

### 3. API Response Typing (Axios)

Type Axios responses explicitly:

```typescript
import type { AxiosResponse } from "axios";
import type { YouTubeReportType } from "@common/youtube.types";

interface ReportTypesResponse {
  reportTypes: YouTubeReportType[];
}

async getAllReportTypes(token: string): Promise<YouTubeReportType[]> {
  const response: AxiosResponse<ReportTypesResponse> = await lastValueFrom(
    this.httpService.get<ReportTypesResponse>(url, { headers })
  );

  return response.data.reportTypes || [];
}
```

---

## Best Practices

### 1. Type Organization

#### ✅ DO

```typescript
// Define types in /common for shared data structures
// common/youtube.types.ts
export interface YouTubeJob {
  id: string;
  name: string;
  reportTypeId: string;
}

// Use utility types for derived types
type CreateJobRequest = Pick<YouTubeJob, "reportTypeId" | "name">;
```

#### ❌ DON'T

```typescript
// Don't duplicate types across frontend and backend
// backend/youtube.interface.ts
interface YouTubeJob { ... }

// frontend/youtube.types.ts
interface YouTubeJob { ... } // ❌ Duplicate!
```

### 2. Type Imports

#### ✅ DO

```typescript
// Use 'type' keyword for type-only imports
import type { YouTubeJob } from "@common/youtube.types";

// Use barrel exports for cleaner imports
import { YouTubeJob, AuthenticatedUser } from "@src/types";
```

#### ❌ DON'T

```typescript
// Don't import values as types
import { YouTubeJob } from "@common/youtube.types"; // ❌ Without 'type'

// Don't import from multiple files when barrel export exists
import { YouTubeJob } from "@common/youtube.types";
import { AuthenticatedUser } from "@common/api.types"; // ❌ Use barrel
```

### 3. Type Safety Over Convenience

#### ✅ DO

```typescript
// Use type guards for unknown types
if (isGoogleProviderMetadata(metadata)) {
  const token = metadata.provider_token; // ✅ Safe
}

// Define explicit return types
async getUser(): Promise<User> {
  // TypeScript enforces return type
}
```

#### ❌ DON'T

```typescript
// Don't use unsafe type assertions
const metadata = user.user_metadata as GoogleProviderMetadata; // ❌ Unsafe!

// Don't omit return types
async getUser() {
  // ❌ Return type is inferred (could be 'any')
}
```

### 4. Error Handling

#### ✅ DO

```typescript
// Type errors properly
try {
  await api.call();
} catch (error: unknown) {
  // Use type guards or instanceof checks
  if (error instanceof AxiosError) {
    this.logger.error(error.response?.data);
  } else if (error instanceof Error) {
    this.logger.error(error.message);
  }
}
```

#### ❌ DON'T

```typescript
// Don't use 'any' for errors
try {
  await api.call();
} catch (error: any) {
  // ❌ Loses type safety
  console.error(error.message);
}
```

---

## Troubleshooting

### Issue 1: TypeScript Can't Find Custom Types

**Symptom:**

```
Cannot find module '@src/types' or its corresponding type declarations.
```

**Solution:**

1. Check `backend/tsconfig.json` includes `typeRoots`:

```json
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/@types", "./src/types"]
  }
}
```

2. Ensure `backend/src/types/express.d.ts` ends with `export {}`:

```typescript
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {}; // ✅ Required for module augmentation
```

### Issue 2: Type Guard Not Narrowing Type

**Symptom:**

```typescript
if (isGoogleProviderMetadata(metadata)) {
  const token = metadata.provider_token; // ❌ Still shows error
}
```

**Solution:**

Ensure type guard return type uses `is`:

```typescript
// ✅ Correct
export function isGoogleProviderMetadata(
  metadata: unknown
): metadata is GoogleProviderMetadata {
  // ...
}

// ❌ Wrong (won't narrow type)
export function isGoogleProviderMetadata(metadata: unknown): boolean {
  // ...
}
```

### Issue 3: Supabase Types Not Auto-Completing

**Symptom:**

```typescript
const { data } = await supabase.from("test_table").select("*");
// data is 'any' instead of typed
```

**Solution:**

1. Ensure Supabase client is typed:

```typescript
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@common/supabase.types";

const client: SupabaseClient<Database> = createClient(url, key);
```

2. Regenerate types if schema changed:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > common/supabase.types.ts
```

### Issue 4: ESLint Complaining About 'any'

**Symptom:**

```
Unsafe assignment of a(n) `any` value @typescript-eslint/no-unsafe-assignment
```

**Solution:**

Use explicit types instead of `any`:

```typescript
// ❌ Bad
const data: any = response.data;

// ✅ Good
import type { YouTubeJob } from "@src/types";
const data: YouTubeJob = response.data;
```

Or use type guards for unknown types:

```typescript
// ✅ Good
const responseData: unknown = error.response?.data;

if (isYouTubeApiErrorResponse(responseData)) {
  const message = responseData.error.message; // Properly typed
}
```

### Issue 5: Circular Import in Common Types

**Symptom:**

```
Import declaration conflicts with local declaration of 'AuthenticatedUser'
```

**Solution:**

Don't import types from the same file where they're defined:

```typescript
// ❌ Bad - circular import in common/api.types.ts
import { AuthenticatedUser } from "@common/api.types";

export interface AuthenticatedUser { ... } // Conflict!

// ✅ Good - define without importing
export interface AuthenticatedUser { ... }
```

Express type extensions should be in `backend/src/types/express.d.ts`, not in common types.

---

## Additional Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [Supabase TypeScript Support](https://supabase.com/docs/guides/api/generating-types)
- [NestJS TypeScript](https://docs.nestjs.com/first-steps)
- [Express TypeScript Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)

---

**Last Updated:** November 14, 2025
