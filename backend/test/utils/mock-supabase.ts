// Reusable Supabase test mocks for unit/e2e tests
// Keeps API surface minimal while staying type-safe.

type SupabaseError = { message: string } | null;

export interface MockSupabaseSelectResult<T> {
  data: T | null;
  error: SupabaseError;
}

export interface MockSupabaseClient<T = unknown> {
  from: jest.MockedFunction<(table: string) => MockSupabaseClient<T>>;
  select: jest.MockedFunction<
    (columns?: string) => Promise<MockSupabaseSelectResult<T>>
  >;
  insert?: jest.MockedFunction<(payload: Partial<T> | Partial<T>[]) => unknown>;
  update?: jest.MockedFunction<(payload: Partial<T>) => unknown>;
  delete?: jest.MockedFunction<() => unknown>;
}

/**
 * Create a lightweight Supabase client mock.
 * By default, `select` resolves to `{ data: null, error: null }`.
 */
export function createMockSupabaseClient<T = unknown>(
  selectResult: MockSupabaseSelectResult<T> = { data: null, error: null },
): MockSupabaseClient<T> {
  const client: MockSupabaseClient<T> = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockResolvedValue(selectResult),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  return client;
}

/**
 * Create a SupabaseService mock that returns the provided mock client.
 * Mirrors the real service surface used in tests.
 */
export function createMockSupabaseService<T = unknown>(
  client: MockSupabaseClient<T> = createMockSupabaseClient<T>(),
) {
  return {
    onModuleInit: jest.fn(),
    getClient: jest.fn(() => client),
    getAdminClient: jest.fn(() => client),
  };
}

/**
 * Utility to reset all mock call history/state for a given mock client.
 */
export function resetMockSupabaseClient(client: MockSupabaseClient): void {
  client.from.mockClear();
  client.select.mockClear();
  client.insert?.mockClear();
  client.update?.mockClear();
  client.delete?.mockClear();
}
