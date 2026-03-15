import React from "react";

export default function EmptyState({ title, text, action }) {
    return (
        <div className="empty-state-card text-center">
            <div className="empty-state-icon">📂</div>
            <h5 className="fw-bold mb-2">{title}</h5>
            <p className="text-muted mb-3">{text}</p>
            {action && <div>{action}</div>}
        </div>
    );
}