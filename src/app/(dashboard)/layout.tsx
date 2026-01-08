"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

// Developer: Tolga Yılmaz
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return <div className="flex items-center justify-center h-screen">Yükleniyor...</div>;
    }

    if (!session) return null;

    return (
        <div className="flex min-h-screen">
            <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
                <Sidebar />
            </div>
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="p-6 overflow-auto">{children}</main>
            </div>
        </div>
    );
}
