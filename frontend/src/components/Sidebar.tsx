import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import type { ReactNode } from "react";

interface SidebarProps {
  menuItems: MenuItem[];
}

interface MenuItem {
  title: string;
  path: string;
  subMenu?: MenuItem[];
}

/**
 * Sidebar - Persistent navigation menu for authenticated routes.
 * Supports nested sub-menus and dynamically highlights the active route.
 */
export function Sidebar({ menuItems }: SidebarProps): ReactNode {
  const location = useLocation();
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const toggleSubMenu = (path: string) => {
    setOpenSubMenu((prev) => (prev === path ? null : path));
  };

  return (
    <nav className="w-64 bg-gray-100 p-4 dark:bg-gray-900">
      <ul className="space-y-4">
        {menuItems.map((item) => (
          <li key={item.path}>
            <div>
              <Link
                to={item.path}
                className={`block rounded-md px-4 py-2 text-sm font-medium ${
                  location.pathname.startsWith(item.path)
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
                onClick={() => item.subMenu && toggleSubMenu(item.path)}
              >
                {item.title}
              </Link>
              {item.subMenu && openSubMenu === item.path && (
                <ul className="mt-2 ml-4 space-y-2">
                  {item.subMenu.map((subItem) => (
                    <li key={subItem.path}>
                      <Link
                        to={subItem.path}
                        className={`block rounded-md px-4 py-2 text-sm font-medium ${
                          location.pathname === subItem.path
                            ? "bg-blue-400 text-white"
                            : "text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800"
                        }`}
                      >
                        {subItem.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ul>
    </nav>
  );
}
