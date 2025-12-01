import type { ReactNode } from "react";

/**
 * AnalyticsDashboard - Responsive analytics dashboard shell.
 * Uses .container and .section for consistent width and spacing.
 * Card for main content, text-gradient for heading.
 * Consistent grid layout for future widgets.
 * Ensures min-width for overlay area for proper alignment.
 */
export const AnalyticsDashboard = (): ReactNode => {
  return (
    // Overlay wrapper ensures min-width for dashboard content area
    <div className="section container min-w-[640px]">
      {/* Heading */}
      <div className="mx-auto mb-8 max-w-5xl">
        <h1 className="text-gradient card-title mb-2 text-3xl font-bold sm:text-4xl">
          Analytics Dashboard
        </h1>
        <p className="card-content text-base">
          This is a placeholder for the analytics dashboard.
        </p>
      </div>

      {/* Responsive grid for dashboard widgets */}
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 xl:grid-cols-3">
        {/* Example Widget Card */}
        <section className="card flex min-h-[180px] flex-col items-start justify-center">
          <h2 className="card-title mb-2 text-xl">Channel Overview</h2>
          <p className="card-content">No data available yet.</p>
        </section>
        <section className="card flex min-h-[180px] flex-col items-start justify-center">
          <h2 className="card-title mb-2 text-xl">Audience Insights</h2>
          <p className="card-content">No data available yet.</p>
        </section>
        <section className="card flex min-h-[180px] flex-col items-start justify-center">
          <h2 className="card-title mb-2 text-xl">Top Videos</h2>
          <p className="card-content">No data available yet.</p>
        </section>
        <section className="card flex min-h-[180px] flex-col items-start justify-center">
          <h2 className="card-title mb-2 text-xl">Traffic Sources</h2>
          <p className="card-content">No data available yet.</p>
        </section>
        <section className="card flex min-h-[180px] flex-col items-start justify-center">
          <h2 className="card-title mb-2 text-xl">Engagement Metrics</h2>
          <p className="card-content">No data available yet.</p>
        </section>
        <section className="card flex min-h-[180px] flex-col items-start justify-center">
          <h2 className="card-title mb-2 text-xl">SEO Suggestions</h2>
          <p className="card-content">No data available yet.</p>
        </section>
      </div>
    </div>
  );
};
