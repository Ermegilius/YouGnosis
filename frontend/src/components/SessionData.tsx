import { useAuth } from "@src/hooks/useAuth";
import Accordion from "@src/components/ui/Accordion";
import { type ReactNode } from "react";

export default function SessionData(): ReactNode {
  const { session } = useAuth();

  return (
    <section className="card">
      <h2 className="card-title mb-4 text-2xl">User Profile</h2>
      <p className="card-content mb-6">Supabase session data below:</p>
      <Accordion title="User Details">
        <pre className="card-content overflow-x-auto text-xs">
          {JSON.stringify(session?.user, null, 2)}
        </pre>
      </Accordion>
    </section>
  );
}
