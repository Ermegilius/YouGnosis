import type { ReactNode } from "react";

interface ErrorMessageProps {
  message: string;
  className?: string;
}

/**
 * ErrorMessage - Displays error messages with consistent styling
 */
export function ErrorMessage({
  message,
  className = "",
}: ErrorMessageProps): ReactNode {
  return (
    <div className={`rounded-lg bg-red-50 p-4 dark:bg-red-900/20 ${className}`}>
      <p className="text-sm text-red-800 dark:text-red-200">{message}</p>
    </div>
  );
}
