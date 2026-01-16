"use client";

import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";

// Developer: Tolga Yılmaz
export function Header() {
    return (
        <header className="flex h-14 items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40 justify-between lg:justify-end">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0">
                    <Sidebar className="w-full border-none" />
                </SheetContent>
            </Sheet>
            <div className="flex flex-1 items-center justify-end">
                {/* Tema değiştirici veya kullanıcı bilgisi buraya gelebilir */}
                <span className="text-sm text-gray-500">v1.0.0</span>
            </div>
        </header>
    );
}
