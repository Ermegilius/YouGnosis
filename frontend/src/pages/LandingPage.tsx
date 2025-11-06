import { Link } from "react-router-dom";
import hero from "../assets/hero.webp";
import { Footer } from "@src/components/Footer";
import { Navigation } from "@src/components/Navigation";
import { ArrowRight } from "lucide-react";

/**
 * LandingPage - refined hero and sections styling
 * - hero uses left-aligned image composition (person left, content centered)
 * - softer overlay, larger readable CTA, improved spacing
 */
export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navigation />

      <section className="relative flex min-h-[640px] items-center justify-center pt-20">
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

        <div className="relative z-10 mx-auto w-full max-w-4xl px-6 text-center">
          <h1 className="mb-4 text-4xl leading-tight font-extrabold tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl">
            Ready to level up your YouTube channel?
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-200 sm:text-xl">
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
            className="w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* features */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">
              Unlock Your Channel's Potential
            </h2>
            <p className="mx-auto max-w-2xl text-base text-gray-600">
              Analytics, competitor insights, and SEO recommendations — all in
              one place.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-lg border p-6 shadow-sm hover:shadow-lg">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Deep Analytics
              </h3>
              <p className="text-sm text-gray-600">
                Views, watch time, retention and more — visualized clearly.
              </p>
            </article>

            <article className="rounded-lg border p-6 shadow-sm hover:shadow-lg">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Competitor Analysis
              </h3>
              <p className="text-sm text-gray-600">
                Compare performance and discover winning strategies.
              </p>
            </article>

            <article className="rounded-lg border p-6 shadow-sm hover:shadow-lg">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                SEO Recommendations
              </h3>
              <p className="text-sm text-gray-600">
                AI-powered title, tag and description suggestions.
              </p>
            </article>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
