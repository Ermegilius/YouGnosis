import { useEffect, useState } from "react";
import { useAuth } from "@src/hooks/useAuth";
import type { ReactNode } from "react";

interface TestData {
  message: string;
  timestamp: string;
  user?: {
    id: string;
    email?: string;
  };
}

/**
 * TestDataDisplay - Component for displaying test data from backend.
 * Uses component classes from index.css for automatic dark mode support.
 */
export function TestDataDisplay(): ReactNode {
  const { session } = useAuth();
  const [data, setData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = session?.access_token;
        if (!token) {
          throw new Error("No access token available");
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/test-data`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch data";
        setError(errorMessage);
        console.error("Error fetching test data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <span className="spinner h-8 w-8" aria-hidden="true" />
          <span className="card-content ml-3">Loading test data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div
          className="rounded-lg bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          <strong className="font-medium">Error:</strong> {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card">
        <p className="card-content text-center">No data available</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card-title mb-4 text-xl">Backend Test Data</h2>

      <div className="space-y-4">
        <div>
          <h3 className="card-title mb-2 text-sm">Message</h3>
          <p className="card-content">{data.message}</p>
        </div>

        <div>
          <h3 className="card-title mb-2 text-sm">Timestamp</h3>
          <p className="card-content">
            {new Date(data.timestamp).toLocaleString()}
          </p>
        </div>

        {data.user && (
          <div>
            <h3 className="card-title mb-2 text-sm">User Info</h3>
            <div className="card-content space-y-1">
              <p>
                <span className="font-medium">ID:</span> {data.user.id}
              </p>
              {data.user.email && (
                <p>
                  <span className="font-medium">Email:</span> {data.user.email}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-lg bg-gray-50 p-4">
        <h3 className="card-title mb-2 text-sm">Raw JSON Response</h3>
        <pre className="card-content overflow-x-auto text-xs">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
