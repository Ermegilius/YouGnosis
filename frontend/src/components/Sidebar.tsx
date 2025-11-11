import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

interface SidebarProps {
  menuItems: { title: string; path: string }[];
}

/**
 * Sidebar - Persistent navigation menu for authenticated routes.
 * Dynamically highlights the active route.
 */
export function Sidebar({ menuItems }: SidebarProps): ReactNode {
  const location = useLocation();

  return (
    <nav className="w-64 bg-gray-100 p-4 dark:bg-gray-900">
      <ul className="space-y-4">
        {menuItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`block rounded-md px-4 py-2 text-sm font-medium ${
                location.pathname === item.path
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
