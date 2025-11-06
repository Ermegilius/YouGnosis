import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@src/hooks/useAuth";
import { TestDataDisplay } from "@src/components/TestDataDisplay";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";

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
Uses Tailwind CSS for layout and styling.
*/
function App() {
  const { session } = useAuth();

  return (
    <>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-red-50 via-white to-blue-50">
        <Navigation />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
          <section className="mb-8 rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              User Profile
            </h2>
            <p className="mb-4 text-gray-600">You are logged in!</p>
            <div className="rounded bg-gray-100 p-4 text-xs text-gray-800">
              <h3 className="mb-2 font-medium text-gray-700">User Details:</h3>
              <pre className="overflow-x-auto">
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
