import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import type { ReactNode } from "react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { ScrollToTop } from "./ScrollToTop";
import { CookiesConsentBanner } from "./CookiesConsentBanner";

/**
 * ProtectedLayout - High-level layout with a persistent sidebar.
 * Sidebar is always rendered left of main content, regardless of Outlet.
 * Main content uses .container and .section for consistent width and spacing.
 */
export function ProtectedLayout(): ReactNode {
  const menuItems = [
    { title: "Dashboard", path: "/dashboard" },
    {
      title: "Analytics",
      path: "/analytics",
      subMenu: [
        { title: "Overview", path: "/analytics/overview" },
        { title: "Report Types", path: "/analytics/report-types" },
        { title: "YouTube Jobs", path: "/analytics/youtube-jobs" },
      ],
    },
    { title: "Competitors", path: "/competitors" },
    { title: "SEO", path: "/seo" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navigation />
      <main className="flex-1 py-24">
        <div className="flex">
          {/* Sidebar always left, does not depend on Outlet */}
          <Sidebar menuItems={menuItems} />
          {/* Main content area */}
          <div className="flex-1">
            <div className="section container">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
      <CookiesConsentBanner />
      <Footer />
    </div>
  );
}
