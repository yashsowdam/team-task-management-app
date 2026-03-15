import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../api/authApi";
import { motion } from "framer-motion";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        password2: "",
    });

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        try {
            await registerUser(formData);
            navigate("/login");
        } catch {
            setError("Registration failed. Check your inputs.");
        }
    }

    return (
        <div className="auth-page">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="auth-card card border-0 shadow-lg"
            >
                <div className="card-body p-4 p-md-5">
                    <h2 className="fw-bold mb-1 text-center">Team Task Management App</h2>
                    <p className="text-muted mb-4 text-center">
                        Create an account to start managing tasks
                    </p>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <input
                                    className="form-control"
                                    placeholder="First name"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <input
                                    className="form-control"
                                    placeholder="Last name"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <input
                                className="form-control"
                                placeholder="Username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Confirm password"
                                value={formData.password2}
                                onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
                                required
                            />
                        </div>

                        <button className="btn btn-primary w-100">Register</button>
                    </form>

                    <p className="text-muted text-center mt-4 mb-0">
                        Already have an account? <Link to="/login">Login</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}