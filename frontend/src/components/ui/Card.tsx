import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Card - Reusable card container with consistent styling
 */
export function Card({ children, className = "" }: CardProps): ReactNode {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`}
    >
      {children}
    </div>
  );
}
