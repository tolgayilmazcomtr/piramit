"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Developer: Tolga Yılmaz
interface AuthContextType {
    token: string | null;
    login: (token: string, role?: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
    role: string | null;
}

const AuthContext = createContext<AuthContextType>({
    token: null,
    login: () => { },
    logout: () => { },
    isAuthenticated: false,
    isLoading: true,
    role: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedRole = localStorage.getItem("role");

        if (storedToken) {
            setToken(storedToken);
            setRole(storedRole);
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, newRole: string = "admin") => {
        localStorage.setItem("token", newToken);
        localStorage.setItem("role", newRole);
        setToken(newToken);
        setRole(newRole);

        // Role göre yönlendirme
        if (newRole === "friend") {
            router.push("/friend/dashboard");
        } else {
            router.push("/dashboard");
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setToken(null);
        setRole(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                login,
                logout,
                isAuthenticated: !!token,
                isLoading,
                role,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
