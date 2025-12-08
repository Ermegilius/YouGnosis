import { createContext } from "react";

type CookiesConsentContextType = {
  consent: "accepted" | "declined" | null;
  setConsent: (consent: "accepted" | "declined") => void;
  resetConsent: () => void;
};

export const CookiesConsentContext = createContext<
  CookiesConsentContextType | undefined
>(undefined);
