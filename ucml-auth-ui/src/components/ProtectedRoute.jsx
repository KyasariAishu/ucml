import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../api/tokenStorage.js";

// Wrap a route's element with this to require a token before rendering it.
// This is a fast, client-side-only check (just "does a token exist?") --
// Dashboard.jsx's getMe() call is what actually verifies the token is
// still valid against the backend.
export default function ProtectedRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}