import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/common/Loader";

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, authLoading } = useAuth();

    if (authLoading) return <Loader />;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}