import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useWorkspaces } from "../hooks/useWorkspaces";
import { useNotifications } from "../hooks/useNotifications";
import Loader from "../components/common/Loader";
import PageHeader from "../components/common/PageHeader";

export default function DashboardPage() {
    const { data: workspaces = [], isLoading: wsLoading } = useWorkspaces();
    const { data: notifications = [], isLoading: notiLoading } = useNotifications();

    if (wsLoading || notiLoading) return <Loader />;

    const unreadNotifications = notifications.filter((item) => !item.is_read).length;
    const readNotifications = notifications.filter((item) => item.is_read).length;

    return (
        <DashboardLayout>
            <PageHeader
                title="Team Task Management App"
                subtitle="Manage workspaces, collaborate on tasks, and track updates from one dashboard."
            />

            <div className="row g-4">
                <div className="col-md-4">
                    <div className="stats-card stats-card-primary">
                        <div className="stats-label">Total Workspaces</div>
                        <div className="stats-value">{workspaces.length}</div>
                        <div className="stats-helper">All workspaces you are part of</div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="stats-card stats-card-accent">
                        <div className="stats-label">Unread Notifications</div>
                        <div className="stats-value">{unreadNotifications}</div>
                        <div className="stats-helper">Pending updates that need attention</div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="stats-card stats-card-muted">
                        <div className="stats-label">Read Notifications</div>
                        <div className="stats-value">{readNotifications}</div>
                        <div className="stats-helper">Updates you have already reviewed</div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}