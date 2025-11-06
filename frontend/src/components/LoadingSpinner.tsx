import type { ReactNode } from "react";

/**
 * LoadingSpinner - Reusable loading indicator.
 * Uses spinner class from index.css for automatic dark mode support.
 */
export function LoadingSpinner(): ReactNode {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="text-center">
        <div className="spinner mx-auto mb-4 h-12 w-12" aria-hidden="true" />
        <p className="card-content">Loading...</p>
      </div>
    </div>
  );
}
