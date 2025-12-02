import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/**

CookiesConsentBanner - GDPR-compliant cookies consent banner for YouGnosis.
User must accept cookies to use the app
Banner blocks Login button until accepted.
Informs users about cookies (analytics, essential, third-party).
Accessible, responsive, styled with Tailwind.
Stores consent in localStorage ("cookiesConsent" = "accepted" | "declined").
Links to Privacy Policy for details.
*/
export function CookiesConsentBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    // Show banner only if consent not set
    const consent = localStorage.getItem("cookiesConsent");
    setVisible(consent !== "accepted");
  }, []);

  const handleConsent = (accepted: boolean) => {
    localStorage.setItem("cookiesConsent", accepted ? "accepted" : "declined");
    window.dispatchEvent(new Event("cookiesConsentChanged"));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed right-0 bottom-0 left-0 z-50 mx-auto w-full max-w-2xl rounded-t-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-900"
      role="dialog"
      aria-live="polite"
      aria-label="Cookies consent"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-4 flex flex-col gap-2">
          <span className="text-lg font-bold">Cookies Required</span>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            YouGnosis requires cookies to operate. We use cookies for
            authentication, analytics, and essential functionality. You must
            accept cookies to log into the app. See our{" "}
            <Link to="/privacy-policy" className="link underline">
              Privacy Policy
            </Link>{" "}
            for details.
          </span>
        </div>
        <div className="mt-2 flex gap-2 sm:mt-0">
          <button
            className="btn-primary px-4 py-2 text-sm"
            onClick={() => handleConsent(true)}
            aria-label="Accept cookies"
          >
            Accept
          </button>
          <button
            className="btn-ghost px-4 py-2 text-sm"
            onClick={() => handleConsent(false)}
            aria-label="Decline cookies"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
