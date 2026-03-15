import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function ProjectCard({ project }) {
    return (
        <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <div className="project-card h-100">
                <div className="project-card-top">
                    <span className="project-chip">Project</span>
                </div>

                <h5 className="fw-bold mb-2">{project.title}</h5>
                <p className="text-muted mb-4">
                    {project.description || "No description added yet."}
                </p>

                <Link to={`/projects/${project.id}`} className="btn btn-outline-primary btn-sm">
                    Open Project
                </Link>
            </div>
        </motion.div>
    );
}