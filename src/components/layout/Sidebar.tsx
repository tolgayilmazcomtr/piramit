"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    PlusCircle,
    ListTodo,
    Users,
    Tags,
    Layers,
    LogOut,
    UserCheck
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

// Developer: Tolga Yılmaz
const adminLinks = [
    { href: "/dashboard", label: "Genel Bakış", icon: LayoutDashboard },
    { href: "/dashboard/tasks/create", label: "Görev Başlat", icon: PlusCircle },
    { href: "/dashboard/tasks", label: "Görev Listesi", icon: ListTodo },
    { href: "/dashboard/people", label: "Kişi Yönetimi", icon: Users },
    { href: "/dashboard/tags", label: "Etiket Yönetimi", icon: Tags },
    { href: "/dashboard/tiers", label: "Katman Yönetimi", icon: Layers },
];

const friendLinks = [
    { href: "/friend/dashboard", label: "Onay Paneli", icon: UserCheck },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const role = (session?.user as any)?.role || "user";

    const links = role === "friend" ? friendLinks : adminLinks;

    return (
        <div className="flex h-full w-64 flex-col border-r bg-white dark:bg-gray-900">
            <div className="flex h-14 items-center border-b px-6">
                <span className="text-lg font-bold">Piramit Admin</span>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start px-4 text-sm font-medium">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-gray-900 dark:hover:text-gray-50",
                                pathname === link.href
                                    ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                                    : "text-gray-500 dark:text-gray-400"
                            )}
                        >
                            <link.icon className="h-4 w-4" />
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="border-t p-4">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-4"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                >
                    <LogOut className="h-4 w-4" />
                    Çıkış Yap
                </Button>
            </div>
        </div>
    );
}
