import { useEffect, useState } from "react";
import { testDataApi } from "@src/api/services";
import { LoadingSpinner } from "./LoadingSpinner";

interface TestData {
  id: string;
  created_at: string;
  some_text_here: string | null;
}

/**
 * TestDataDisplay - Component to display test data from backend API.
 * Uses LoadingSpinner for loading state.
 */
export function TestDataDisplay() {
  const [data, setData] = useState<TestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await testDataApi.getAllTestData();
        setData(result);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="mt-4 text-lg font-semibold text-red-900">Error</h2>
          <p className="mt-2 text-sm text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-6 text-3xl font-bold text-gray-900">
          Test Data from Backend
        </h2>
        <div className="rounded-lg bg-white p-6 shadow-md">
          <p className="mb-4 text-sm text-gray-600">
            Fetched {data.length} records
          </p>
          <pre className="overflow-x-auto rounded bg-gray-900 p-4 text-sm text-green-400">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
