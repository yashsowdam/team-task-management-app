import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "../hooks/useNotifications";

export default function NotificationsPage() {
    const { data: notifications = [], isLoading } = useNotifications();
    const markOne = useMarkNotificationRead();
    const markAll = useMarkAllNotificationsRead();

    if (isLoading) return <Loader />;

    const unreadCount = notifications.filter((item) => !item.is_read).length;

    return (
        <DashboardLayout>
            <PageHeader
                title="Notifications"
                subtitle="Track task creation, assignments, and status updates across your workspace."
                action={
                    notifications.length > 0 ? (
                        <button
                            className="btn btn-outline-primary"
                            onClick={() => markAll.mutate()}
                            disabled={markAll.isPending}
                        >
                            {markAll.isPending ? "Updating..." : "Mark all as read"}
                        </button>
                    ) : null
                }
            />

            {notifications.length === 0 ? (
                <EmptyState
                    title="No notifications"
                    text="You are all caught up. New updates will appear here."
                />
            ) : (
                <>
                    <div className="notification-summary mb-4">
                        <span className="badge bg-primary-subtle text-primary px-3 py-2">
                            {unreadCount} unread
                        </span>
                    </div>

                    <div className="d-flex flex-column gap-3">
                        {notifications.map((item) => (
                            <div
                                key={item.id}
                                className={`notification-card ${!item.is_read ? "notification-card-unread" : ""}`}
                            >
                                <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                                    <div className="flex-grow-1">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            {!item.is_read && <span className="notification-dot"></span>}
                                            <span className="notification-type">
                                                {item.notification_type.replaceAll("_", " ")}
                                            </span>
                                        </div>

                                        <h6 className="fw-semibold mb-1">{item.message}</h6>
                                        <p className="text-muted mb-0 small">
                                            Notification ID: #{item.id}
                                        </p>
                                    </div>

                                    {!item.is_read && (
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => markOne.mutate(item.id)}
                                            disabled={markOne.isPending}
                                        >
                                            Mark read
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </DashboardLayout>
    );
}