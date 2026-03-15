import React, { createContext, useEffect, useState } from "react";
import { clearTokens, isLoggedIn, setTokens } from "./auth";
import { getMe, loginUser } from "../api/authApi";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    async function loadUser() {
        if (!isLoggedIn()) {
            setUser(null);
            setAuthLoading(false);
            return;
        }

        try {
            const me = await getMe();
            setUser(me);
        } catch (error) {
            clearTokens();
            setUser(null);
        } finally {
            setAuthLoading(false);
        }
    }

    async function login(credentials) {
        const data = await loginUser(credentials);
        setTokens({
            access: data.access,
            refresh: data.refresh,
        });
        await loadUser();
    }

    function logout() {
        clearTokens();
        setUser(null);
    }

    useEffect(() => {
        loadUser();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                authLoading,
                login,
                logout,
                loadUser,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}