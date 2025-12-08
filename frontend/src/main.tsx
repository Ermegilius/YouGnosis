import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./context/AuthProvider.tsx";
import { AppRouter } from "./router/router.tsx";
import { ThemeProvider } from "./context/ThemeProvider.tsx";
import { CookiesConsentProvider } from "./context/CookiesConsentContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <CookiesConsentProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </AuthProvider>
      </CookiesConsentProvider>
    </ThemeProvider>
  </StrictMode>,
);
