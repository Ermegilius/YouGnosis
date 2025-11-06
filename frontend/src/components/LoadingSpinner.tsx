import type { ReactNode } from "react";

/**
 * LoadingSpinner - Reusable loading indicator component.
 * Uses Tailwind CSS for styling with smooth animations.
 */
export function LoadingSpinner(): ReactNode {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-blue-50">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent" />
        <p className="mt-4 text-sm text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
