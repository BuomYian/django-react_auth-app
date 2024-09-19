import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Use the default import
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";

function ProtectedRoute({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(null); // Start as null

  useEffect(() => {
    const authenticateUser = async () => {
      await auth(); // Wait for the authentication process
    };

    authenticateUser(); // Call authentication when component mounts
  }, []);

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);

    try {
      const res = await api.post("/api/token/refresh/", {
        refresh: refreshToken,
      });

      if (res.status === 200) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.error(error); // Log the error for debugging
      setIsAuthorized(false);
    }
  };

  const auth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);

    if (!token) {
      setIsAuthorized(false); // No token found, user is unauthorized
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const tokenExpiration = decoded.exp;
      const now = Date.now() / 1000; // Convert milliseconds to seconds

      if (tokenExpiration < now) {
        // Token expired, attempt to refresh
        await refreshToken();
      } else {
        // Token is still valid
        setIsAuthorized(true);
      }
    } catch (error) {
      console.error("Token decoding failed:", error);
      setIsAuthorized(false);
    }
  };

  // Show a loading state while determining authorization status
  if (isAuthorized === null) {
    return <div>Loading...</div>; // You can replace this with a loading spinner
  }

  // If authorized, render children; otherwise, redirect to login
  return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
