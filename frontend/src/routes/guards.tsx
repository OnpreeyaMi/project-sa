import React from "react";
import { Navigate } from "react-router-dom";

export const RequireRole: React.FC<{ role: "admin" | "employee" | "customer"; children: React.ReactNode }> = ({ role, children }) => {
  const token = localStorage.getItem("token");
  const current = localStorage.getItem("role");
  if (!token) return <Navigate to="/" replace />;
  if (current !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
};
