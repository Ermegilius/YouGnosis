import { useAuth } from "@src/hooks/useAuth";
import { TestDataDisplay } from "@src/components/TestDataDisplay";
import type { ReactNode } from "react";

/**
 * DashboardPage - Main dashboard view for authenticated users.
 * Displays user profile and test data.
 * Uses component classes from index.css for automatic dark mode support.
 */
export default function DashboardPage(): ReactNode {
  const { session } = useAuth();

  return (
    <div className="space-y-8">
      {/* User Profile Section */}
      <section className="card">
        <h2 className="card-title mb-4 text-2xl">User Profile</h2>
        <p className="card-content mb-6">
          Welcome back! You are successfully logged in.
        </p>

        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <h3 className="card-title mb-3 text-sm">User Details</h3>
          <pre className="card-content overflow-x-auto text-xs">
            {JSON.stringify(session?.user, null, 2)}
          </pre>
        </div>
      </section>

      {/* Test Data Section */}
      <section>
        <TestDataDisplay />
      </section>
    </div>
  );
}
