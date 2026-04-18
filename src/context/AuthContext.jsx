// src/context/AuthContext.jsx
// Provides global auth state across the entire app.
// Any component can call useAuth() to get:
//   - user (the logged in user object or null)
//   - login() function
//   - logout() function
import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Try to load user from localStorage on first load
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("flatsync_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("flatsync_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("flatsync_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — any component can call useAuth()
export function useAuth() {
  return useContext(AuthContext);
}