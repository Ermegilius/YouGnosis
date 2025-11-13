import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import type { ReactNode } from "react";

/**
 * ProtectedLayout - High-level layout with a persistent sidebar.
 * Wraps all authenticated routes.
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
      ],
    },
    { title: "Competitors", path: "/competitors" },
    { title: "SEO", path: "/seo" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar menuItems={menuItems} />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-900">
        <Outlet />
      </div>
    </div>
  );
}
