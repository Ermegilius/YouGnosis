import type { ReactNode } from "react";

/**
 * Footer - Application footer for all pages.
 * Uses component classes from index.css for automatic dark mode support.
 */
export function Footer(): ReactNode {
  return (
    <footer className="card-content mt-12 border-t py-6 text-center text-xs shadow-inner">
      &copy; {new Date().getFullYear()} YouGnosis. All rights reserved.
    </footer>
  );
}
