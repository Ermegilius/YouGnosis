import { Link } from "react-router-dom";
import { useAuth } from "@src/hooks/useAuth";
import type { ReactNode } from "react";
import logo from "@src/assets/mock-logo.png";

/**
 * Navigation - Unified navigation bar for both anonymous and authenticated users.
 * Uses Tailwind CSS and conditionally displays user menu or sign-in link.
 * Inspired by Harakka navigation pattern.
 */
export function Navigation(): ReactNode {
  const { session, signOut } = useAuth();

  return (
    <header className='sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm'>
      <nav
        className='mx-auto flex max-w-7xl items-center justify-between px-6 py-4'
        aria-label='Main navigation'
      >
        {/* Logo and Brand */}
        <Link
          to={session ? "/dashboard" : "/"}
          className='flex items-center gap-3 transition-opacity hover:opacity-80'
          aria-label='YouGnosis home'
        >
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-blue-600'>
            <img src={logo} alt='mock logo' />
          </div>
          <span className='text-xl font-bold text-gray-900'>YouGnosis</span>
        </Link>

        {/* Navigation Links (visible when authenticated) */}
        {session && (
          <div className='hidden items-center gap-6 md:flex'>
            <Link
              to='/dashboard'
              className='text-sm font-medium text-gray-700 transition-colors hover:text-blue-600'
            >
              Dashboard
            </Link>
            <Link
              to='/analytics'
              className='text-sm font-medium text-gray-700 transition-colors hover:text-blue-600'
            >
              Analytics
            </Link>
            <Link
              to='/competitors'
              className='text-sm font-medium text-gray-700 transition-colors hover:text-blue-600'
            >
              Competitors
            </Link>
            <Link
              to='/seo'
              className='text-sm font-medium text-gray-700 transition-colors hover:text-blue-600'
            >
              SEO
            </Link>
          </div>
        )}

        {/* Right Side Actions */}
        <div className='flex items-center gap-4'>
          {/* GitHub Link (always visible) */}
          <a
            href='https://github.com/ermegilius/yougnosis'
            target='_blank'
            rel='noopener noreferrer'
            className='hidden text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 sm:block'
            aria-label='View YouGnosis on GitHub'
          >
            GitHub
          </a>

          {/* Conditional: Sign In or User Menu */}
          {session ? (
            <>
              {/* User Email */}
              <span className='hidden text-sm text-gray-700 sm:inline'>
                {session.user.email}
              </span>

              {/* User Avatar/Icon */}
              <div className='flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-blue-600 text-sm font-semibold text-white'>
                {session.user.email?.charAt(0).toUpperCase() || "U"}
              </div>

              {/* Sign Out Button */}
              <button
                onClick={signOut}
                className='rounded-lg bg-gradient-to-r from-red-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:from-red-600 hover:to-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2'
                aria-label='Sign out'
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              {/* Sign In Link */}
              <Link
                to='/login'
                className='rounded-lg bg-gradient-to-r from-red-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:from-red-600 hover:to-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2'
                aria-label='Sign in'
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
