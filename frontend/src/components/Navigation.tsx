import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@src/hooks/useAuth";
import { useTheme } from "@src/hooks/useTheme";
import { useState } from "react";
import { Menu, X, Sun, Moon, LogOut } from "lucide-react";
import GoogleOAuth2Button from '@src/components/GoogleOAuth2Button';

/**
 * Navigation - unified header for anon + authenticated users
 * - use Tailwind responsive classes (no JS media detection)
 * - logo (flex-none) | centered nav (flex-1) | actions (flex-none)
 */
export function Navigation() {
  const { session, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const go = (path: string) => {
    setMobileOpen(false);
    navigate(path);
  };

  return (
    <header
      className="app-header fixed inset-x-0 top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80"
      role="banner"
    >
      <div className="container mx-auto flex h-[84px] items-center justify-between px-4 sm:px-6 lg:px-10">
        {/* Left: Logo */}
        <button
          onClick={() => go(session ? "/dashboard" : "/")}
          className="flex items-center gap-3 focus:outline-none"
          aria-label="YouGnosis home"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-red-500 to-blue-600 shadow-sm">
            <svg
              className="h-6 w-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            YouGnosis
          </span>
        </button>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex md:flex-1 md:items-center md:justify-center md:gap-8">
          <Link
            to="/"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
          >
            Home
          </Link>

          <Link
            to="/dashboard"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
          >
            Dashboard
          </Link>
          <Link
            to="/analytics"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
          >
            Analytics
          </Link>
          <Link
            to="/competitors"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
          >
            Competitors
          </Link>
          <Link
            to="/seo"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
          >
            SEO
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label={
              theme === "dark"
                ? "Switch to light theme"
                : "Switch to dark theme"
            }
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {/* Authenticated User Actions */}
          {session ? (
            <div className="flex items-center gap-3">
              <span className="hidden max-w-[12rem] truncate text-sm text-gray-700 sm:inline dark:text-gray-300">
                {session.user.email}
              </span>
              <button
                onClick={signOut}
                className="hidden items-center gap-2 rounded-md bg-gradient-to-r from-red-500 to-blue-600 px-3 py-1 text-sm font-medium text-white shadow-sm hover:opacity-95 focus:outline-none sm:inline-flex"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>
          ) : (
            <GoogleOAuth2Button />
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="ml-1 inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 md:hidden dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="absolute top-[84px] right-0 left-0 z-40 bg-white dark:bg-gray-900">
          <nav className="flex flex-col gap-3 p-4">
            <button
              onClick={() => go("/dashboard")}
              className="text-left text-base font-medium text-gray-800 dark:text-gray-200"
            >
              Dashboard
            </button>
            <button
              onClick={() => go("/analytics")}
              className="text-left text-base font-medium text-gray-800 dark:text-gray-200"
            >
              Analytics
            </button>
            <button
              onClick={() => go("/competitors")}
              className="text-left text-base font-medium text-gray-800 dark:text-gray-200"
            >
              Competitors
            </button>
            <button
              onClick={() => go("/seo")}
              className="text-left text-base font-medium text-gray-800 dark:text-gray-200"
            >
              SEO
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
