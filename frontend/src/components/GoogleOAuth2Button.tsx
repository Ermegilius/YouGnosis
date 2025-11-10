import React from "react";

const GoogleOAuthButton: React.FC = () => {
  const handleLogin = () => {
    // Redirect to the backend OAuth2 authorize endpoint
    window.location.href = "http://127.0.0.1:3000/api/oauth2/authorize";
  };

  return (
    <button
      onClick={handleLogin}
      className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
    >
      Login with Google
    </button>
  );
};

export default GoogleOAuthButton;
