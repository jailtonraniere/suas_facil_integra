"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
    LayoutDashboard, Map, List, Search, BarChart2,
    Settings, LogOut, Shield, ChevronRight
} from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/painel", label: "Painel Territorial", icon: Map },
    { href: "/listas", label: "Listas Inteligentes", icon: List },
    { href: "/busca-ativa", label: "Busca Ativa", icon: Search },
    { href: "/relatorios", label: "Relatórios", icon: BarChart2 },
    { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push("/login");
    }

    return (
        <aside className="w-64 min-h-screen bg-[#1e3a8a] flex flex-col">
            {/* Brand */}
            <div className="px-6 py-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="w-10 h-10 object-contain bg-white rounded-lg p-1"
                    />
                    <div>
                        <div className="text-white font-bold text-sm leading-tight flex items-center gap-1">
                            SUAS<span className="font-normal opacity-90">Fácil</span>
                        </div>
                        <div className="text-blue-200 text-xs font-medium">Integra - Mauá</div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const active = pathname.startsWith(href);
                    return (
                        <Link key={href} href={href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${active
                                ? "bg-blue-700 text-white"
                                : "text-blue-200 hover:bg-blue-800 hover:text-white"
                                }`}>
                            <Icon className="w-4.5 h-4.5 shrink-0" size={18} />
                            <span className="flex-1">{label}</span>
                            {active && <ChevronRight size={14} className="text-blue-300" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="px-3 py-4 border-t border-blue-800">
                <button onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-blue-200 hover:bg-blue-800 hover:text-white transition-colors">
                    <LogOut size={18} />
                    Sair
                </button>
            </div>
        </aside>
    );
}
