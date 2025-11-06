import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@src/hooks/useAuth";
import { TestDataDisplay } from "@src/components/TestDataDisplay";
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
  const { session } = useAuth();

  return (
    <>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col">
        <Navigation />
        <main className="container mx-auto flex-1 py-24">
          <section className="card mb-8">
            <h2 className="card-title mb-2 text-xl">User Profile</h2>
            <p className="card-content mb-4">You are logged in!</p>
            <div className="rounded bg-gray-100 p-4 text-xs">
              <h3 className="card-title mb-2 text-sm">User Details:</h3>
              <pre className="card-content overflow-x-auto">
                {JSON.stringify(session?.user, null, 2)}
              </pre>
            </div>
          </section>
          <section>
            <TestDataDisplay />
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default App;
