import { Navigation } from "@src/components/Navigation";
import { Footer } from "@src/components/Footer";
import { Outlet } from "react-router-dom";
import type { ReactNode } from "react";
import { ScrollToTop } from "./ScrollToTop";

/**
 * AnonLayout - Wrapper for all public/anonymous pages.
 * Renders Navigation, Footer, and the current route via Outlet.
 * Ensures main content uses .container for full width and spacing.
 */
export function AnonLayout(): ReactNode {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
