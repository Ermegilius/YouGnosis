import type { ReactNode } from "react";
import { Link } from "react-router-dom";

/**
 * Footer - Application footer for all pages.
 * Uses component classes from index.css for automatic dark mode support.
 */
export function Footer(): ReactNode {
  return (
    <footer className="card-content mt-12 border-t py-6 text-center text-xs shadow-inner">
      &copy; {new Date().getFullYear()} YouGnosis. All rights reserved.
      <br />
      <span>DEVELOPMENT: version_10.12.2025_1</span>
      <br />
      <span>
        <Link to="/privacy-policy" className="link mx-2">
          Privacy Policy
        </Link>
        |
        <Link to="/terms-of-use" className="link mx-2">
          Terms of Use
        </Link>
      </span>
    </footer>
  );
}
