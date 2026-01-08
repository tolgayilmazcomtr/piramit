import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Piramit Admin",
    description: "Görev Dağıtım Sistemi Admin Paneli",
};

import NextAuthProvider from "@/providers/NextAuthProvider";

// Developer: Tolga Yılmaz
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="tr" suppressHydrationWarning>
            <body
                className={cn(
                    "min-h-screen bg-background font-sans antialiased",
                    inter.className
                )}
            >
                <NextAuthProvider>{children}</NextAuthProvider>
            </body>
        </html>
    );
}
