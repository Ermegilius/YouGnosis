import { TestDataDisplay } from "@src/components/TestDataDisplay";
import type { ReactNode } from "react";
import SessionData from "@src/components/SessionData";

/**
 * DashboardPage - Main dashboard view for authenticated users.
 * Displays user profile and test data.
 * Uses component classes from index.css for automatic dark mode support.
 */
export default function DashboardPage(): ReactNode {
  return (
    <div className="space-y-8">
      {/* User Profile Section */}
      <SessionData />

      {/* Test Data Section */}
      <section>
        <TestDataDisplay />
      </section>
    </div>
  );
}
