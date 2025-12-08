import { useEffect, useState } from "react";
import { CookiesConsentContext } from "./CookiesConsentContext";

export const CookiesConsentProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [consent, setConsentState] = useState<"accepted" | "declined" | null>(
    () =>
      localStorage.getItem("cookiesConsent") as "accepted" | "declined" | null,
  );

  const setConsent = (value: "accepted" | "declined") => {
    localStorage.setItem("cookiesConsent", value);
    setConsentState(value);
  };

  const resetConsent = () => {
    localStorage.removeItem("cookiesConsent");
    setConsentState(null);
  };

  useEffect(() => {
    const handler = () => {
      setConsentState(
        localStorage.getItem("cookiesConsent") as
          | "accepted"
          | "declined"
          | null,
      );
    };
    window.addEventListener("cookiesConsentChanged", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("cookiesConsentChanged", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return (
    <CookiesConsentContext.Provider
      value={{ consent, setConsent, resetConsent }}
    >
      {children}
    </CookiesConsentContext.Provider>
  );
};
