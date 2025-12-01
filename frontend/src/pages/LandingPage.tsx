import { Link } from "react-router-dom";
import hero from "../assets/hero.webp";
import { ArrowRight } from "lucide-react";

/**
 * LandingPage - refined hero and sections styling
 * - hero uses left-aligned image composition (person left, content centered)
 * - softer overlay, larger readable CTA, improved spacing
 * - dark mode handled via global CSS in index.css
 * - layout uses .container for full width, not max-w-4xl
 */
export default function LandingPage() {
  return (
    <main className="flex flex-col">
      <section className="relative flex min-h-[640px] items-center justify-center">
        {/* background image positioned to left to mimic your screenshots */}
        <div
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url(${hero})`,
            backgroundPosition: "20% center",
          }}
          role="img"
          aria-label="YouTube analytics background"
        />

        {/* overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 via-transparent to-gray-900/40" />

        {/* Use .container for full width and spacing */}
        <div className="relative z-10 container w-full text-center">
          <h1 className="mb-4 text-4xl leading-tight font-extrabold tracking-tight text-white text-shadow-md sm:text-5xl md:text-6xl">
            Ready to level up your YouTube channel?
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-white text-shadow-sm sm:text-xl">
            Browse analytics, optimize content, and bring your vision to life
            with data-driven recommendations.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>

            <a
              href="https://github.com/ermegilius/yougnosis"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 md:flex"
            >
              View on GitHub
            </a>
          </div>
        </div>

        {/* decorative bottom wave */}
        <div
          className="pointer-events-none absolute right-0 bottom-0 left-0"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 1440 120"
            className="fill-page-bg w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" />
          </svg>
        </div>
      </section>

      {/* features */}
      <section className="section">
        <div className="mx-auto max-w-7xl">
          {/* MVP disclaimer */}
          <div className="mb-6">
            <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-900 shadow dark:bg-yellow-900/20 dark:text-yellow-200">
              <strong>Disclaimer:</strong> YouGnosis is in its initial
              development stage (MVP). Features and data may change, and bugs
              may occur. Use at your own risk.
            </div>
          </div>
          <div className="mb-12 text-center">
            <h2 className="card-title mb-4 text-2xl sm:text-3xl">
              Unlock Your Channel's Potential
            </h2>
            <p className="card-content mx-auto max-w-2xl text-base">
              Analytics, competitor insights, and SEO recommendations — all in
              one place.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <article className="card">
              <h3 className="card-title mb-2 text-lg">Deep Analytics</h3>
              <p className="card-content">
                Views, watch time, retention and more — visualized clearly.
              </p>
            </article>

            <article className="card">
              <h3 className="card-title mb-2 text-lg">Competitor Analysis</h3>
              <p className="card-content">
                Compare performance and discover winning strategies.
              </p>
            </article>

            <article className="card">
              <h3 className="card-title mb-2 text-lg">SEO Recommendations</h3>
              <p className="card-content">
                AI-powered title, tag and description suggestions.
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
