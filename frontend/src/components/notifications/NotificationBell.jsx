import React from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotifications";

export default function NotificationBell() {
    const { data = [] } = useNotifications();
    const unreadCount = data.filter((item) => !item.is_read).length;

    return (
        <Link to="/notifications" className="btn btn-light position-relative border">
            🔔
            {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {unreadCount}
                </span>
            )}
        </Link>
    );
}