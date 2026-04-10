"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Menu } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="lg:hidden sticky top-0 z-30 bg-[#1e3a8a] px-4 py-3 flex items-center gap-3 shadow-md">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg text-white hover:bg-blue-700 transition-colors"
                        aria-label="Abrir menu"
                    >
                        <Menu size={22} />
                    </button>
                    <img
                        src="/logo_full.png"
                        alt="SUAS Fácil Integra"
                        className="h-8 w-auto object-contain bg-white rounded px-1.5 py-0.5"
                    />
                </header>

                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
