import { Outlet } from "react-router-dom";
import type { ReactNode } from "react";

/**

App - Main dashboard shell for authenticated users.
Uses component classes from index.css for automatic dark mode support.
*/
function App(): ReactNode {
  return <Outlet />;
}

export default App;
