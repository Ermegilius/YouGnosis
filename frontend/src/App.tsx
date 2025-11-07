import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import type { ReactNode } from "react";

/**

ScrollToTop - ensures the window scrolls to top on route change.
*/
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

/**

App - Main dashboard shell for authenticated users.
Uses component classes from index.css for automatic dark mode support.
*/
function App(): ReactNode {
  return (
    <>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col">
        <Navigation />
        <main className="container mx-auto flex-1 py-24">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}

export default App;
