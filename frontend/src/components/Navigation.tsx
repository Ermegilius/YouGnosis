import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@src/hooks/useAuth";
import type { ReactNode } from "react";
import { useState } from "react";
import { Menu, X, Github as GithubIcon, User, LogOut } from "lucide-react";

/**
 * Navigation - unified header for anon + authenticated users
 * - use Tailwind responsive classes (no JS media detection)
 * - logo (flex-none) | centered nav (flex-1) | actions (flex-none)
 */
export function Navigation(): ReactNode {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const go = (path: string) => {
    setMobileOpen(false);
    navigate(path);
  };

  return (
    <header
      className="app-header fixed inset-x-0 top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-sm"
      role="banner"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex h-[84px] flex-nowrap items-center justify-between">
          {/* left: logo (do not shrink) */}
          <div className="flex flex-none items-center gap-4">
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
              <span className="text-lg font-semibold text-gray-900">
                YouGnosis
              </span>
            </button>
          </div>

          {/* center: links (desktop) - flex-1 keeps them centered */}
          <nav className="hidden md:flex md:flex-1 md:items-center md:justify-center md:gap-8">
            <Link
              to="/"
              className="text-sm font-medium whitespace-nowrap text-gray-700 hover:text-gray-900"
            >
              Home
            </Link>
            <Link
              to="/features"
              className="text-sm font-medium whitespace-nowrap text-gray-700 hover:text-gray-900"
            >
              Features
            </Link>
            <Link
              to="/pricing"
              className="text-sm font-medium whitespace-nowrap text-gray-700 hover:text-gray-900"
            >
              Pricing
            </Link>
            <Link
              to="/docs"
              className="text-sm font-medium whitespace-nowrap text-gray-700 hover:text-gray-900"
            >
              Docs
            </Link>
          </nav>

          {/* right: actions (do not grow) */}
          <div className="flex flex-none items-center gap-3">
            <a
              href="https://github.com/ermegilius/yougnosis"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 sm:inline-flex"
              aria-label="YouGnosis on GitHub"
            >
              <GithubIcon className="h-5 w-5" />
              <span>GitHub</span>
            </a>

            {session ? (
              <div className="flex items-center gap-3">
                <span className="hidden max-w-[12rem] truncate text-sm text-gray-700 sm:inline">
                  {session.user.email}
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-blue-600 text-sm font-semibold text-white">
                  {session.user.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <button
                  onClick={signOut}
                  className="hidden items-center gap-2 rounded-md bg-gradient-to-r from-red-500 to-blue-600 px-3 py-1 text-sm font-medium text-white shadow-sm hover:opacity-95 focus:outline-none sm:inline-flex"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => go("/login")}
                className="hidden items-center gap-2 rounded-md bg-gradient-to-r from-red-500 to-blue-600 px-3 py-1 text-sm font-medium text-white shadow-sm hover:opacity-95 focus:outline-none sm:inline-flex"
              >
                <User className="h-4 w-4" />
                <span>Sign In</span>
              </button>
            )}

            {/* mobile toggle (Tailwind controls visibility) */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="ml-1 inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 md:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* mobile menu - absolute overlay (won't push content) */}
      <div
        className={`absolute top-[84px] right-0 left-0 z-40 transition-all duration-200 ease-in-out md:hidden ${
          mobileOpen
            ? "visible opacity-100"
            : "pointer-events-none invisible opacity-0"
        }`}
      >
        <div className="mx-auto max-w-7xl rounded-b-lg border-t border-gray-100 bg-white/95 px-4 py-4 shadow-lg">
          <nav className="flex flex-col gap-3">
            <button
              onClick={() => go("/")}
              className="text-left text-base font-medium text-gray-800"
            >
              Home
            </button>
            <button
              onClick={() => go("/features")}
              className="text-left text-base font-medium text-gray-800"
            >
              Features
            </button>
            <button
              onClick={() => go("/pricing")}
              className="text-left text-base font-medium text-gray-800"
            >
              Pricing
            </button>
            <button
              onClick={() => go("/docs")}
              className="text-left text-base font-medium text-gray-800"
            >
              Docs
            </button>

            <div className="mt-3 border-t pt-3">
              {session ? (
                <>
                  <p className="mb-2 text-sm text-gray-600">
                    {session.user.email}
                  </p>
                  <button
                    onClick={signOut}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-red-500 to-blue-600 px-3 py-2 text-sm font-medium text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => go("/login")}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-red-500 to-blue-600 px-3 py-2 text-sm font-medium text-white"
                >
                  <User className="h-4 w-4" />
                  Sign in
                </button>
              )}

              <a
                className="mt-3 block text-sm text-gray-700"
                href="https://github.com/ermegilius/yougnosis"
                target="_blank"
                rel="noreferrer"
              >
                View on GitHub
              </a>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
