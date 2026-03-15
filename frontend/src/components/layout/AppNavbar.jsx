import React from "react";
import { Link, useNavigate } from "react-router-dom";
import NotificationBell from "../notifications/NotificationBell";
import { useAuth } from "../../hooks/useAuth";

export default function AppNavbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top shadow-sm app-navbar">
            <div className="container-fluid px-4">
                <Link className="navbar-brand d-flex align-items-center gap-2 brand-link" to="/dashboard">
                    <div className="brand-logo">TT</div>
                    <div>
                        <div className="brand-title">Team Task Management App</div>
                        <div className="brand-subtitle">Workspace collaboration</div>
                    </div>
                </Link>

                <div className="d-flex align-items-center gap-3">
                    <NotificationBell />
                    <div className="text-end d-none d-md-block">
                        <div className="fw-semibold small">{user?.username}</div>
                        <div className="text-muted small">{user?.email}</div>
                    </div>
                    <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}