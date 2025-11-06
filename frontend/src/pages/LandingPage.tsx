import { Link } from "react-router-dom";
import hero from "../assets/hero.webp";
import { Footer } from "@src/components/Footer";
import { Navigation } from "@src/components/Navigation";

/**
 * LandingPage - Public landing page for YouGnosis
 * Responsive design inspired by Harakka layout with full-width hero section
 * Uses Tailwind CSS for all styling
 * Displays unified navigation, hero section, features, CTA, and footer
 */
export default function LandingPage() {
  return (
    <div className='flex min-h-screen flex-col bg-white'>
      {/* Unified Navigation - works for both anon and authenticated users */}
      <Navigation />

      {/* Hero Section with Background Image */}
      <section
        className='relative flex min-h-[600px] items-center justify-center overflow-hidden'
        aria-labelledby='hero-heading'
      >
        {/* Background Image */}
        <div
          className='absolute inset-0 bg-cover bg-center bg-no-repeat'
          style={{ backgroundImage: `url(${hero})` }}
          role='img'
          aria-label='YouTube analytics dashboard background'
        />

        {/* Dark Overlay for better text readability */}
        <div className='absolute inset-0 bg-gradient-to-br from-gray-900/70 via-gray-800/60 to-gray-900/70' />

        {/* Content Container */}
        <div className='relative z-10 mx-auto max-w-4xl px-6 py-20 text-center'>
          <h1
            id='hero-heading'
            className='mb-6 text-5xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg sm:text-6xl lg:text-7xl'
          >
            Ready to level up your YouTube channel?
          </h1>
          <p className='mb-10 text-xl text-gray-100 drop-shadow-md sm:text-2xl'>
            Browse analytics, optimize content, and bring your vision to life.
          </p>
          <Link
            to='/login'
            className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all hover:scale-105 hover:from-red-600 hover:to-blue-700 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2'
            aria-label='Get started with YouGnosis'
          >
            Get Started
            <svg
              className='h-5 w-5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              aria-hidden='true'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13 7l5 5m0 0l-5 5m5-5H6'
              />
            </svg>
          </Link>
        </div>

        {/* Decorative Bottom Wave */}
        <div className='absolute bottom-0 left-0 right-0' aria-hidden='true'>
          <svg
            viewBox='0 0 1440 120'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className='w-full'
          >
            <path
              d='M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z'
              fill='white'
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section
        className='bg-white px-6 py-20'
        aria-labelledby='features-heading'
      >
        <div className='mx-auto max-w-7xl'>
          <div className='mb-16 text-center'>
            <h2
              id='features-heading'
              className='mb-4 text-3xl font-bold text-gray-900 sm:text-4xl'
            >
              Unlock Your Channel's Potential
            </h2>
            <p className='mx-auto max-w-2xl text-lg text-gray-600'>
              Everything you need to analyze, optimize, and grow your YouTube
              presence
            </p>
          </div>

          {/* Features Grid */}
          <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
            {/* Feature 1 - Deep Analytics */}
            <article className='group rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:border-red-300 hover:shadow-lg'>
              <div
                className='mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600'
                aria-hidden='true'
              >
                <svg
                  className='h-7 w-7 text-white'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                  />
                </svg>
              </div>
              <h3 className='mb-3 text-xl font-semibold text-gray-900'>
                Deep Analytics
              </h3>
              <p className='text-gray-600'>
                Track views, watch time, retention rates, and audience growth
                with comprehensive dashboards and real-time insights.
              </p>
            </article>

            {/* Feature 2 - Competitor Analysis */}
            <article className='group rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:border-blue-300 hover:shadow-lg'>
              <div
                className='mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600'
                aria-hidden='true'
              >
                <svg
                  className='h-7 w-7 text-white'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                  />
                </svg>
              </div>
              <h3 className='mb-3 text-xl font-semibold text-gray-900'>
                Competitor Analysis
              </h3>
              <p className='text-gray-600'>
                Compare your performance with competitors and discover winning
                strategies to stay ahead in your niche.
              </p>
            </article>

            {/* Feature 3 - SEO Recommendations */}
            <article className='group rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:border-purple-300 hover:shadow-lg sm:col-span-2 lg:col-span-1'>
              <div
                className='mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600'
                aria-hidden='true'
              >
                <svg
                  className='h-7 w-7 text-white'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M13 10V3L4 14h7v7l9-11h-7z'
                  />
                </svg>
              </div>
              <h3 className='mb-3 text-xl font-semibold text-gray-900'>
                SEO Recommendations
              </h3>
              <p className='text-gray-600'>
                Get AI-powered suggestions for titles, tags, and descriptions to
                boost discoverability and reach more viewers.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className='bg-gradient-to-br from-red-50 to-blue-50 px-6 py-20'
        aria-labelledby='cta-heading'
      >
        <div className='mx-auto max-w-4xl text-center'>
          <h2
            id='cta-heading'
            className='mb-4 text-3xl font-bold text-gray-900 sm:text-4xl'
          >
            Start optimizing your channel today
          </h2>
          <p className='mb-8 text-lg text-gray-600'>
            Join content creators who are already growing faster with YouGnosis
          </p>
          <Link
            to='/login'
            className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:scale-105 hover:from-red-600 hover:to-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2'
            aria-label='Get started with YouGnosis for free'
          >
            Get Started Free
            <svg
              className='h-5 w-5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              aria-hidden='true'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13 7l5 5m0 0l-5 5m5-5H6'
              />
            </svg>
          </Link>
          <p className='mt-4 text-sm text-gray-500'>
            Free to start • No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
