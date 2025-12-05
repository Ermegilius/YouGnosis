import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import type { ReactNode } from "react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { ScrollToTop } from "./ScrollToTop";
import { CookiesConsentBanner } from "./CookiesConsentBanner";

/**
 * ProtectedLayout - Responsive layout with sidebar.
 * - Mobile: sidebar as horizontal menu above content
 * - Desktop: sidebar on the left, content on the right
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

      {/* Main content area with header offset */}
      <main className="flex-1 pt-[84px]">
        <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          {/* Responsive flex: column on mobile, row on desktop */}
          <div className="flex flex-col gap-4 md:flex-row md:gap-6 lg:gap-8">
            {/* Sidebar component handles its own responsive display */}
            <Sidebar menuItems={menuItems} />

            {/* Main content area - takes remaining space */}
            <div className="min-w-0 flex-1">
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
