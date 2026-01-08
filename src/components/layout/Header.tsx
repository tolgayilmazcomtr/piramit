"use client";

// Developer: Tolga Yılmaz
export function Header() {
    return (
        <header className="flex h-14 items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
            <div className="flex flex-1 items-center justify-end">
                {/* Tema değiştirici veya kullanıcı bilgisi buraya gelebilir */}
                <span className="text-sm text-gray-500">v1.0.0</span>
            </div>
        </header>
    );
}
