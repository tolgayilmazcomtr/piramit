"use client";

import { AuthProvider } from "@/context/AuthContext";

// Developer: Tolga Yılmaz
export default function NextAuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AuthProvider>{children}</AuthProvider>;
}
