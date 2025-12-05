import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

interface SidebarProps {
  menuItems: MenuItem[];
}

interface MenuItem {
  title: string;
  path: string;
  subMenu?: MenuItem[];
}

/**
 * Sidebar - Vertical navigation menu for authenticated routes (desktop only).
 * Disappears at the same breakpoint where the mobile menu appears (lg:hidden).
 */
export function Sidebar({ menuItems }: SidebarProps): ReactNode {
  const location = useLocation();
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const toggleSubMenu = (path: string) => {
    setOpenSubMenu((prev) => (prev === path ? null : path));
  };

  const isActive = (path: string) => location.pathname.startsWith(path);
  const isExactActive = (path: string) => location.pathname === path;

  // Sidebar is visible only on large screens and up (lg:block)
  return (
    <nav className="hidden w-56 flex-shrink-0 lg:block lg:w-64">
      <div className="sticky top-24 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <div>
                {item.subMenu ? (
                  <button
                    onClick={() => toggleSubMenu(item.path)}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? "bg-blue-500 text-white"
                        : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    {item.title}
                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${openSubMenu === item.path ? "rotate-90" : ""}`}
                    />
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? "bg-blue-500 text-white"
                        : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    {item.title}
                  </Link>
                )}

                {/* Submenu */}
                {item.subMenu && openSubMenu === item.path && (
                  <ul className="mt-1 ml-3 space-y-1 border-l-2 border-gray-200 pl-3 dark:border-gray-700">
                    {item.subMenu.map((subItem) => (
                      <li key={subItem.path}>
                        <Link
                          to={subItem.path}
                          className={`block rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                            isExactActive(subItem.path)
                              ? "bg-blue-400/50 text-blue-700 dark:text-blue-300"
                              : "text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
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
      </div>
    </nav>
  );
}
