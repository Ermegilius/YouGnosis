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
    { title: "Analytics", path: "/analytics" },
    { title: "Competitors", path: "/competitors" },
    { title: "SEO", path: "/seo" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar menuItems={menuItems} />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}
