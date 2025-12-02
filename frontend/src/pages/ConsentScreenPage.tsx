// frontend/src/components/ConsentScreen.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import GoogleOAuth2Button from "@src/components/GoogleOAuth2Button";

export function ConsentScreenPage() {
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const consent = localStorage.getItem("cookiesConsent");

  const canContinue = agreedPrivacy && agreedTerms && consent === "accepted";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg dark:bg-gray-900">
        <h2 className="mb-4 text-center text-xl font-bold">
          Sign In to YouGnosis
        </h2>
        <div className="mb-4">
          <label className="mb-2 flex items-center">
            <input
              type="checkbox"
              checked={agreedPrivacy}
              onChange={() => setAgreedPrivacy(!agreedPrivacy)}
              className="mr-2"
            />
            I have read and agree to the{" "}
            <Link
              to="/privacy-policy"
              className="ml-1 text-blue-600 underline"
              target="_blank"
            >
              Privacy Policy
            </Link>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={() => setAgreedTerms(!agreedTerms)}
              className="mr-2"
            />
            I have read and agree to the{" "}
            <Link
              to="/terms-of-use"
              className="ml-1 text-blue-600 underline"
              target="_blank"
            >
              Terms of Use
            </Link>
          </label>
        </div>
        <GoogleOAuth2Button disabled={!canContinue} />
      </div>
    </div>
  );
}
