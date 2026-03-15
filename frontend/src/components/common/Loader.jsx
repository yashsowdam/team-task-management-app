import React from "react";

export default function Loader() {
    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
            <div className="text-center">
                <div className="spinner-border text-primary mb-3" role="status" />
                <p className="text-muted mb-0">Loading...</p>
            </div>
        </div>
    );
}