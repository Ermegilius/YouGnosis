import { TestDataDisplay } from "@src/components/TestDataDisplay";
import type { ReactNode } from "react";
import SessionData from "@src/components/SessionData";

/**
 * DashboardPage - Main dashboard view for authenticated users.
 * Displays user profile, test data, and placeholder sections for future features.
 */
export default function DashboardPage(): ReactNode {
  return (
    // Use only .container for horizontal width, .section for vertical spacing.
    // Add responsive grid for cards on larger screens.
    <div className="section container">
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
        <DashboardSection title="User Profile">
          <SessionData />
        </DashboardSection>

        <DashboardSection title="Test Data">
          <TestDataDisplay />
        </DashboardSection>

        <DashboardSection title="Channel Performance">
          <PlaceholderContent />
        </DashboardSection>

        <DashboardSection title="SEO Recommendations">
          <PlaceholderContent />
        </DashboardSection>

        <DashboardSection title="Competitor Analysis">
          <PlaceholderContent />
        </DashboardSection>
      </div>
    </div>
  );
}

/**
 * DashboardSection - Wrapper for dashboard sections with consistent styling.
 */
function DashboardSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactNode {
  return (
    <section className="card flex flex-col">
      <h2 className="card-title mb-4 text-2xl">{title}</h2>
      {children}
    </section>
  );
}

/**
 * PlaceholderContent - Placeholder for sections without data.
 */
function PlaceholderContent(): ReactNode {
  return <p className="card-content">No data available yet.</p>;
}
