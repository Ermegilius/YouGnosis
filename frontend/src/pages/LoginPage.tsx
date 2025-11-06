import { Auth } from "@src/components/Auth";
import type { ReactNode } from "react";

/**
 * LoginPage - Dedicated page for authentication.
 * Dark mode styling handled by body background from index.css.
 */
export default function LoginPage(): ReactNode {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Auth />
    </div>
  );
}
