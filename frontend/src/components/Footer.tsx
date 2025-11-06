import type { ReactNode } from "react";

/**
 * Footer - Application footer for all pages.
 * Uses Tailwind CSS and displays copyright.
 */
export function Footer(): ReactNode {
  return (
    <footer className="mt-12 border-t bg-white py-6 text-center text-xs text-gray-400 shadow-inner">
      &copy; {new Date().getFullYear()} YouGnosis. All rights reserved.
    </footer>
  );
}
