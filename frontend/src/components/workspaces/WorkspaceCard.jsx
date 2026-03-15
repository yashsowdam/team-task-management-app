import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function WorkspaceCard({ workspace }) {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="col-md-6 col-lg-4"
        >
            <div className="card border-0 shadow-sm workspace-card h-100">
                <div className="card-body">
                    <h5 className="fw-bold">{workspace.name}</h5>
                    <p className="text-muted">{workspace.description || "No description added yet."}</p>
                    <Link to={`/workspaces/${workspace.id}`} className="btn btn-primary btn-sm">
                        Open Workspace
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}