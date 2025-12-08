import { useContext } from "react";
import { CookiesConsentContext } from "@src/context/CookiesConsentContext";

/**

useCookiesConsent - Custom hook for accessing cookies consent state.
Returns consent value, setConsent, and resetConsent functions.
*/
export const useCookiesConsent = (): {
  consent: "accepted" | "declined" | null;
  setConsent: (consent: "accepted" | "declined") => void;
  resetConsent: () => void;
} => {
  const ctx = useContext(CookiesConsentContext);
  if (!ctx)
    throw new Error(
      "useCookiesConsent must be used within CookiesConsentProvider",
    );
  return ctx;
};
