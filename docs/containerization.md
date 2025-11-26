# YouGnosis Project Containerization Guide

## Overview

YouGnosis uses Docker and Docker Compose to provide reproducible, isolated environments for both frontend and backend services. This enables local development, CI/CD, and cloud deployment with consistent configuration and security.

---

## Architecture

- **Frontend:** React + Vite, served by Nginx in production container.
- **Backend:** NestJS, runs in Node.js container.
- **Database:** Supabase (managed, not containerized).
- **Shared Types:** `/common` folder, mounted/copied into both services.

---

## Folder Structure

```
/YouGnosis
  /frontend          # React + Vite frontend
  /backend           # NestJS backend
  /common            # Shared TypeScript types (supabase.types.ts)
  .env.development   # Root-level environment variables
  .env.production    # Production environment variables
  docker-compose.yml
  /docs
    containerization.md
```

---

## Environment Variables

- All variables are stored in root `.env.development` and `.env.production`.
- Backend and frontend containers receive env vars via Docker Compose `env_file`.
- Frontend build uses Vite's `--mode` flag to select env file.

**Frontend (Vite):**

- Variables prefixed with `VITE_` are injected at build time.
- Example:
  ```
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
  ```

**Backend (NestJS):**

- Uses `ConfigModule` to load env vars at runtime.
- Example:
  ```
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_SECRET_KEY_DEFAULT=sb_secret_xxx
  ```

---

## Docker Compose

```yaml
version: "3.8"

services:
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    env_file:
      - .env.development
    ports:
      - "3000:3000"
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    env_file:
      - .env.development
    ports:
      - "8000:80"
    restart: unless-stopped
    depends_on:
      - backend
```

---

## Dockerfile Patterns

### Backend (`backend/Dockerfile`)

- Multi-stage build: dependencies, build, then production image.
- Copies shared types from `/common`.
- Entrypoint: `node dist/backend/src/main.js`.

### Frontend (`frontend/Dockerfile`)

- Multi-stage build: Node.js for build, Nginx for serving static files.
- Copies `.env.development` to build context for Vite.
- Uses `RUN npm run build -- --mode development` to ensure correct env injection.
- Entrypoint: Nginx serving `/usr/share/nginx/html`.

---

## Build & Run

**Build all containers:**

```sh
docker-compose build
```

**Start all services:**

```sh
docker-compose up
```

**Access the app:**

- Frontend: [http://localhost:8000](http://localhost:8000)
- Backend API: [http://localhost:3000/api](http://localhost:3000/api)

---

## Common Issues & Solutions

- **Frontend env vars undefined:**  
  Ensure `.env.development` is present in build context and Vite build uses correct mode.
- **Backend env vars missing:**  
  Check `env_file` in Compose and use `ConfigService` for access.
- **Shared types not found:**  
  Confirm `/common` is copied/mounted in both containers.

---

## Best Practices

- Use multi-stage builds for smaller, secure images.
- Never expose secret keys to frontend.
- Use path aliases for shared types.
- Validate all env vars before use.
- Rebuild containers after changing env files.

---

## References

- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [NestJS ConfigModule](https://docs.nestjs.com/techniques/configuration)
- [Supabase Docs](https://supabase.com/docs)
