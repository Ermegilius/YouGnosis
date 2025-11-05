import { api } from "../axios";

/**
 * Test data row interface matching Supabase schema
 */
interface TestData {
  id: string;
  created_at: string;
  some_text_here: string | null;
}

/**
 * API service for test data endpoints
 */
export const testDataApi = {
  /**
   * Get all test data from the backend
   */
  getAllTestData: (): Promise<TestData[]> => api.get("/test-data"),

  /**
   * Get a specific test data entry by ID
   */
  getTestDataById: (id: string): Promise<TestData> =>
    api.get(`/test-data/${id}`),

  /**
   * Create a new test data entry
   */
  createTestData: (data: Partial<TestData>): Promise<TestData> =>
    api.post("/test-data", data),

  /**
   * Update an existing test data entry
   */
  updateTestData: (id: string, data: Partial<TestData>): Promise<TestData> =>
    api.put(`/test-data/${id}`, data),

  /**
   * Delete a test data entry
   */
  deleteTestData: (id: string): Promise<{ success: boolean; id: string }> =>
    api.delete(`/test-data/${id}`),
};
