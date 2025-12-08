import { Navigation } from "@src/components/Navigation";
import { Footer } from "@src/components/Footer";
import { Outlet } from "react-router-dom";
import type { ReactNode } from "react";
import { ScrollToTop } from "./ScrollToTop";
import { CookiesConsentBanner } from "./CookiesConsentBanner";

/**
 * AnonLayout - Wrapper for all public/anonymous pages.
 * Renders Navigation, Footer, and the current route via Outlet.
 */
export function AnonLayout(): ReactNode {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navigation />
      {/* Add pt-[84px] to offset fixed header */}
      <main className="flex-1 pt-[84px]">
        <Outlet />
      </main>
      <CookiesConsentBanner />
      <Footer />
    </div>
  );
}
