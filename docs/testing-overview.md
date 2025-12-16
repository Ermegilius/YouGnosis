# Testing Overview

This document describes the current test coverage and testing approach for the YouGnosis project.

---

## Backend Testing

### Test Types

#### 1. End-to-End (E2E) Tests

- **Location:** [`backend/test/`](../backend/test/)
- **Framework:** Jest (with NestJS testing utilities)
- **Purpose:** Validate the backend API stack, including Supabase integration and middleware.

##### Key E2E Test Files

- [`app.e2e-spec.ts`](../backend/test/app.e2e-spec.ts)
  - Verifies the `/api` endpoint responds as expected.
  - Ensures the application boots with a mocked Supabase client for isolation.

- [`modules/test-data/test-data.e2e-spec.ts`](../backend/test/modules/test-data/test-data.e2e-spec.ts)
  - Tests the `/api/test-data` endpoint.
  - Uses a mocked Supabase client to avoid real database connections.
  - Checks that the endpoint returns the expected array of test data rows.

- [`modules/test-data/test-data.integration.e2e-spec.ts`](../backend/test/modules/test-data/test-data.integration.e2e-spec.ts)
  - Runs against a real Supabase instance (using `.env.test`).
  - Verifies backend connectivity to Supabase and actual data retrieval.
  - Checks configuration variables and validates the structure of returned data.

##### Utilities

- [`utils/mock-supabase.ts`](../backend/test/utils/mock-supabase.ts)
  - Provides mock implementations for Supabase clients and services to isolate tests from external dependencies.

- [`utils/test-app.factory.ts`](../backend/test/utils/test-app.factory.ts)
  - Factory for creating a NestJS test application with global pipes and configuration mirroring `main.ts`.

---

### Running Tests

- **Locally:**

  Run all backend tests with:

  ```sh
  npm run test:backend:e2e
  ```

- **CI:**

  All tests are executed automatically on push and pull request to `main` via [GitHub Actions workflow](../.github/workflows/tests.yml).

---

### Coverage

- Test coverage reports are generated and uploaded as artifacts in CI.
- Coverage output is located in the `coverage/` and `backend/coverage/` directories.

---

### Notes

- E2E tests use both mocked and real Supabase connections for isolation and integration coverage.
- All test data types are imported from shared types in [`common/supabase.types.ts`](../common/supabase.types.ts) to ensure type safety.
- The test suite is designed to be extended as new modules and endpoints are added.
