import React from "react";
import { Link, useLocation } from "react-router-dom";
import AppNavbar from "./AppNavbar";

export default function DashboardLayout({ children }) {
    const location = useLocation();

    return (
        <>
            <AppNavbar />
            <div className="container-fluid">
                <div className="row">
                    <aside className="col-md-3 col-lg-2 bg-white border-end min-vh-100 p-3 sidebar-shell">
                        <div className="sidebar-brand mb-4">
                            <div className="sidebar-brand-title">Team Task</div>
                            <div className="sidebar-brand-subtitle">Management Workspace</div>
                        </div>

                        <div className="nav flex-column gap-2">
                            <Link
                                className={`sidebar-link ${location.pathname === "/dashboard" ? "active" : ""}`}
                                to="/dashboard"
                            >
                                Dashboard
                            </Link>

                            <Link
                                className={`sidebar-link ${location.pathname === "/workspaces" ? "active" : ""}`}
                                to="/workspaces"
                            >
                                Workspaces
                            </Link>

                            <Link
                                className={`sidebar-link ${location.pathname === "/notifications" ? "active" : ""}`}
                                to="/notifications"
                            >
                                Notifications
                            </Link>
                        </div>
                    </aside>

                    <main className="col-md-9 col-lg-10 p-4 app-main-bg">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}