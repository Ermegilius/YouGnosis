# Environment Configuration Setup Guide

## Overview

This document outlines the environment configuration setup for the YouGnosis application, including backend (NestJS) and frontend (Vite) configurations.

## Table of Contents

1. [Environment Files](#environment-files)
2. [Configuration Variables](#configuration-variables)
3. [NestJS Configuration](#nestjs-configuration)
4. [Variable Expansion](#variable-expansion)
5. [Validation Schema](#validation-schema)
6. [Cross-Platform Environment Setup](#cross-platform-environment-setup)
7. [Security Best Practices](#security-best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Environment Files

### File Structure

```
YouGnosis/
├── .env.development      # Development environment
├── .env.production       # Production environment
├── .env.test            # Test environment
└── backend/
    └── src/
        ├── app.module.ts    # Configuration module
        └── main.ts          # Bootstrap file
```

### Environment Selection

The application automatically selects the environment file based on the `NODE_ENV` variable:

- `development` → `.env.development`
- `production` → `.env.production`
- `test` → `.env.test`

---

## Configuration Variables

### Application Configuration

| Variable          | Type   | Default                 | Description                                                   |
| ----------------- | ------ | ----------------------- | ------------------------------------------------------------- |
| `NODE_ENV`        | string | `development`           | Application environment (`development`, `production`, `test`) |
| `PORT`            | number | `3000`                  | Backend server port                                           |
| `ALLOWED_ORIGINS` | string | `http://localhost:8000` | Comma-separated list of allowed CORS origins                  |

**Example:**

```bash
NODE_ENV=development
PORT=3000
ALLOWED_ORIGINS=http://localhost:8000
```

### Supabase Configuration

| Variable                      | Type         | Required | Description                           |
| ----------------------------- | ------------ | -------- | ------------------------------------- |
| `SUPABASE_PROJECT_ID`         | string       | ✅ Yes   | Your Supabase project ID              |
| `SUPABASE_DB_PASSWORD`        | string       | ✅ Yes   | Database password                     |
| `SUPABASE_URL`                | string (URI) | ✅ Yes   | Full Supabase URL                     |
| `SUPABASE_STORAGE_URL`        | string (URI) | ✅ Yes   | Supabase storage endpoint             |
| `SUPABASE_PUBLISHABLE_KEY`    | string       | ✅ Yes   | Public API key (safe for client-side) |
| `SUPABASE_SECRET_KEY_DEFAULT` | string       | ✅ Yes   | Secret API key (server-side only)     |

**Example:**

```bash
SUPABASE_PROJECT_ID=your_project_id
SUPABASE_DB_PASSWORD=your_db_password
SUPABASE_URL=https://${SUPABASE_PROJECT_ID}.supabase.co
SUPABASE_STORAGE_URL=https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/s3
SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SECRET_KEY_DEFAULT=your_secret_key
```

### Frontend Configuration

| Variable            | Type         | Required | Description               |
| ------------------- | ------------ | -------- | ------------------------- |
| `VITE_SUPABASE_URL` | string (URI) | ✅ Yes   | Supabase URL for frontend |
| `VITE_API_URL`      | string (URI) | ✅ Yes   | Backend API URL           |

**Note:** Vite requires variables to be prefixed with `VITE_` to be exposed to the client.

**Example:**

```bash
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_API_URL=http://localhost:3000
```

---

## NestJS Configuration

### ConfigModule Setup

The application uses `@nestjs/config` with the following features:

```typescript
ConfigModule.forRoot({
  isGlobal: true, // Available throughout the app
  cache: true, // Cache configuration for performance
  expandVariables: true, // Enable ${VAR} expansion
  envFilePath: [`../.env.${process.env.NODE_ENV || "development"}`],
});
```

### Key Features

1. **Global Configuration**: Available in all modules without re-importing
2. **Caching**: Configuration values are cached for better performance
3. **Variable Expansion**: Supports `${VARIABLE}` syntax for dynamic values
4. **Environment-specific files**: Automatic file selection based on `NODE_ENV`
5. **Validation**: Schema-based validation using Joi

---

## Variable Expansion

### How It Works

Variable expansion allows you to reference other environment variables within your `.env` file:

```bash
# Base variable
SUPABASE_PROJECT_ID=vlezvlibttcwbvqylzux

# Expanded variables
SUPABASE_URL=https://${SUPABASE_PROJECT_ID}.supabase.co
SUPABASE_STORAGE_URL=https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/s3
```

### Benefits

- **DRY Principle**: Define values once, reference multiple times
- **Maintainability**: Update project ID in one place
- **Consistency**: Ensures related URLs stay synchronized

### Usage in Code

```typescript
const configService = app.get(ConfigService);
const url = configService.get<string>("SUPABASE_URL");
// Returns: https://vlezvlibttcwbvqylzux.supabase.co
```

---

## Validation Schema

### Schema Definition

The application validates all environment variables using Joi:

```typescript
validationSchema: Joi.object({
  NODE_ENV: Joi.string().valid("development", "production", "test"),
  PORT: Joi.number().port(),
  ALLOWED_ORIGINS: Joi.string(),
  SUPABASE_PROJECT_ID: Joi.string().required(),
  SUPABASE_URL: Joi.string().uri().required(),
  // ...other validations
});
```

### Validation Rules

- **Type Checking**: Ensures correct data types (string, number, URI)
- **Required Fields**: Fails if critical variables are missing
- **Value Constraints**: Validates ports, URIs, and allowed values
- **Default Values**: Provides fallbacks for optional variables

### Validation Options

```typescript
validationOptions: {
  allowUnknown: true,    // Allow extra variables not in schema
  abortEarly: false      // Show all errors, not just first one
}
```

---

## Cross-Platform Environment Setup

### Using `cross-env`

The project uses `cross-env` to set environment variables in a cross-platform compatible way. This ensures the application works consistently across Windows, macOS, and Linux.

#### Why `cross-env`?

Different operating systems use different syntax for setting environment variables:

```bash
# Linux/macOS
NODE_ENV=production npm start

# Windows CMD
set NODE_ENV=production && npm start

# Windows PowerShell
$env:NODE_ENV="production"; npm start
```

`cross-env` abstracts these differences:

```bash
# Works on all platforms
cross-env NODE_ENV=production npm start
```

### Package Scripts

The `package.json` defines environment-specific scripts using `cross-env`:

```json
{
  "scripts": {
    "start:dev": "cross-env NODE_ENV=development nest start --watch",
    "start:debug": "cross-env NODE_ENV=development nest start --debug --watch",
    "start:test": "cross-env NODE_ENV=test nest start --watch",
    "start:prod": "cross-env NODE_ENV=production node dist/main"
  }
}
```

### How It Works

1. **`cross-env NODE_ENV=development`**: Sets the `NODE_ENV` variable
2. **File Selection**: ConfigModule reads this value and loads the corresponding `.env` file:
   ```typescript
   envFilePath: [`../.env.${process.env.NODE_ENV || "development"}`];
   ```
3. **Environment Loading**: The appropriate configuration is loaded based on the environment

### Running Different Environments

#### Development Mode

```bash
npm run start:dev
# Sets NODE_ENV=development
# Loads .env.development
# Enables hot-reload with --watch
```

#### Debug Mode

```bash
npm run start:debug
# Sets NODE_ENV=development
# Loads .env.development
# Enables debugging on port 9229
# Enables hot-reload
```

#### Test Mode

```bash
npm run start:test
# Sets NODE_ENV=test
# Loads .env.test
# Enables hot-reload for testing
```

#### Production Mode

```bash
npm run start:prod
# Sets NODE_ENV=production
# Loads .env.production
# Runs compiled JavaScript from dist/
```

### Manual Environment Override

You can override the environment variable when running scripts:

```bash
# Override for a single run
cross-env NODE_ENV=staging npm run start:dev

# Chain multiple environment variables
cross-env NODE_ENV=development PORT=4000 npm run start:dev
```

### Installation

The `cross-env` package is included in `devDependencies`:

```json
{
  "devDependencies": {
    "cross-env": "^10.1.0"
  }
}
```

To install:

```bash
npm install --save-dev cross-env
```

### Benefits

1. **Cross-Platform Compatibility**: Single command works on Windows, macOS, and Linux
2. **CI/CD Integration**: No need for platform-specific build scripts
3. **Team Collaboration**: Developers on different OSs use the same commands
4. **Error Prevention**: Reduces errors from incorrect environment variable syntax

### Best Practices

1. **Always use `cross-env`** for setting `NODE_ENV` in scripts
2. **Don't hardcode environment variables** in code - use ConfigService
3. **Document custom scripts** that require specific environments
4. **Use descriptive script names** (e.g., `start:dev`, `start:prod`)

### Troubleshooting `cross-env`

#### Issue: `cross-env: command not found`

**Solution**: Install the package

```bash
npm install
# or
npm install --save-dev cross-env
```

#### Issue: Environment variable not being set

**Solution**: Verify script syntax

```json
// ✅ Correct
"start:dev": "cross-env NODE_ENV=development nest start"

// ❌ Wrong - space before equals
"start:dev": "cross-env NODE_ENV = development nest start"

// ❌ Wrong - quotes around variable
"start:dev": "cross-env \"NODE_ENV=development\" nest start"
```

---

## Usage Examples

### Accessing Configuration in Services

```typescript
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MyService {
  constructor(private configService: ConfigService) {}

  getSupabaseUrl(): string {
    return this.configService.getOrThrow<string>("SUPABASE_URL");
  }

  getPort(): number {
    return this.configService.get<number>("PORT", 3000); // With default
  }
}
```

### Bootstrap Configuration

```typescript
const configService = app.get(ConfigService);
const port = configService.getOrThrow<number>("PORT");
const origins = configService.getOrThrow<string>("ALLOWED_ORIGINS").split(",");

app.enableCors({
  origin: origins,
  credentials: true,
});

await app.listen(port);
```

---

## Additional Resources

- [NestJS Configuration Documentation](https://docs.nestjs.com/techniques/configuration)
- [Joi Validation Library](https://joi.dev/api/)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

## Changelog

| Version | Date       | Changes               |
| ------- | ---------- | --------------------- |
| 1.0.0   | 03.11.2025 | Initial documentation |
