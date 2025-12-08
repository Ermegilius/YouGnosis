import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@src/hooks/useAuth";
import { useTheme } from "@src/hooks/useTheme";
import { useState } from "react";
import { Menu, X, Sun, Moon, LogOut } from "lucide-react";
import { useCookiesConsent } from "@src/hooks/useCookiesConsent";

/**
 * Navigation - unified header for anon + authenticated users
 */
export function Navigation() {
  const { session, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { consent } = useCookiesConsent();

  // Close mobile menu on navigation
  const handleMobileNav = (path: string) => {
    setMobileOpen(false);
    navigate(path);
  };

  return (
    <header
      className="app-header fixed inset-x-0 top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80"
      role="banner"
    >
      <div className="container mx-auto flex h-[84px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <button
          onClick={() => handleMobileNav("/")}
          className="flex items-center gap-2 focus:outline-none sm:gap-3"
          aria-label="YouGnosis home"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-red-500 to-blue-600 shadow-sm sm:h-10 sm:w-10">
            <svg
              className="h-5 w-5 text-white sm:h-6 sm:w-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
          <span className="text-base font-semibold text-gray-900 sm:text-lg dark:text-gray-100">
            YouGnosis
          </span>
        </button>

        {/* Center: Navigation Links for logged in users (desktop only) */}
        <nav className="hidden px-2 lg:flex lg:flex-1 lg:items-center lg:justify-center lg:gap-6 xl:gap-8">
          {session && (
            <>
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
            </>
          )}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
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
            <div className="flex items-center gap-2 sm:gap-3">
              {/* User name - hidden on very small screens */}
              <span className="hidden max-w-[100px] truncate text-sm text-gray-700 sm:inline lg:max-w-[150px] dark:text-gray-300">
                {session.user.user_metadata.name}
              </span>
              {/* Sign out - always visible with icon, text hidden on mobile */}
              <button
                onClick={signOut}
                className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-red-500 to-blue-600 px-2 py-1.5 text-sm font-medium text-white shadow-sm hover:opacity-95 focus:outline-none sm:gap-2 sm:px-3"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleMobileNav("/consent")}
              className={`inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-red-500 to-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:opacity-95 focus:outline-none sm:px-4 sm:py-2 ${
                consent !== "accepted"
                  ? "cursor-not-allowed opacity-50"
                  : "opacity-100"
              }`}
              aria-label="Sign in"
              disabled={consent !== "accepted"}
              title={
                consent !== "accepted"
                  ? "Accept cookies to enable sign in"
                  : undefined
              }
            >
              <span>Sign in</span>
            </button>
          )}

          {/* Mobile Menu Toggle - only for authenticated users */}
          {session && (
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="ml-1 inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 lg:hidden dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu - slides down */}
      {mobileOpen && session && (
        <div className="absolute top-[84px] right-0 left-0 z-40 border-b border-gray-200 bg-white shadow-lg lg:hidden dark:border-gray-700 dark:bg-gray-900">
          <nav className="container mx-auto flex flex-col gap-1 p-4">
            <button
              onClick={() => handleMobileNav("/")}
              className="rounded-md px-4 py-2 text-left text-base font-medium text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Home
            </button>
            <button
              onClick={() => handleMobileNav("/dashboard")}
              className="rounded-md px-4 py-2 text-left text-base font-medium text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Dashboard
            </button>

            {/* Analytics with submenu */}
            <div className="flex flex-col">
              <button
                onClick={() => handleMobileNav("/analytics")}
                className="rounded-md px-4 py-2 text-left text-base font-medium text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Analytics
              </button>
              <div className="ml-4 flex flex-col border-l-2 border-gray-200 pl-2 dark:border-gray-700">
                <button
                  onClick={() => handleMobileNav("/analytics/overview")}
                  className="rounded-md px-4 py-1.5 text-left text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  Overview
                </button>
                <button
                  onClick={() => handleMobileNav("/analytics/report-types")}
                  className="rounded-md px-4 py-1.5 text-left text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  Report Types
                </button>
                <button
                  onClick={() => handleMobileNav("/analytics/youtube-jobs")}
                  className="rounded-md px-4 py-1.5 text-left text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  YouTube Jobs
                </button>
              </div>
            </div>

            <button
              onClick={() => handleMobileNav("/competitors")}
              className="rounded-md px-4 py-2 text-left text-base font-medium text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Competitors
            </button>
            <button
              onClick={() => handleMobileNav("/seo")}
              className="rounded-md px-4 py-2 text-left text-base font-medium text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              SEO
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
