import React from "react";

export default function PageHeader({ title, subtitle, action }) {
    return (
        <div className="page-header-card mb-4">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                <div>
                    <h2 className="fw-bold mb-1">{title}</h2>
                    {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
                </div>
                {action && <div>{action}</div>}
            </div>
        </div>
    );
}