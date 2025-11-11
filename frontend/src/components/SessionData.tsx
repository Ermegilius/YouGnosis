import { useAuth } from "@src/hooks/useAuth";
import { type ReactNode } from "react";
import Accordion from "./ui/Accordion";

export default function SessionData(): ReactNode {
  const { session } = useAuth();

  return (
    <section className="card">
      <h2 className="card-title mb-4 text-2xl">User Profile</h2>

      <p className="card-content mb-6">Session data below:</p>

      <Accordion title="User Details">
        <pre className="card-content overflow-x-auto text-xs">
          {JSON.stringify(session?.user, null, 2)}
        </pre>
      </Accordion>
    </section>
  );
}
