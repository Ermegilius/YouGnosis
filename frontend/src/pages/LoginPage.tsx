import { Auth } from "@src/components/Auth";
import GoogleOAuthButton from "@src/components/GoogleOAuth2Button";
import type { ReactNode } from "react";

/**
 * LoginPage - Dedicated page for authentication.
 * Dark mode styling handled by body background from index.css.
 */
export default function LoginPage(): ReactNode {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Auth />
      <GoogleOAuthButton />
    </div>
  );
}
