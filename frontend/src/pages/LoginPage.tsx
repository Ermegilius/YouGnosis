import { Auth } from "@src/components/Auth";

/**

LoginPage - Dedicated page for authentication.
Uses Tailwind CSS for styling and is placed in the /pages folder as per project guidelines.
*/
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-blue-50 p-4">
      {" "}
      <Auth />{" "}
    </div>
  );
}
// --- Usage in router ---
// Replace <Auth /> with <LoginPage /> in your router for the "/" route:
//
// import LoginPage from "@src/pages/LoginPage";
//
// <Route path='/' element={<LoginPage />} />
//
// This keeps your authentication UI clean, styled, and consistent with your project structure.
