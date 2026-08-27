import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    const dashMap = { owner: "/dashboard/owner", vet: "/dashboard/vet", shelter: "/dashboard/shelter" };
    return <Navigate to={dashMap[user.role] || "/"} replace />;
  }

  return children;
}
