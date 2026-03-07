"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
    LayoutDashboard, Map, List, Search, BarChart2,
    Settings, LogOut, ChevronRight
} from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["SECRETARIO_MUNICIPAL", "GESTOR_OPERACIONAL", "COORDENADOR_UNIDADE", "TECNICO_REFERENCIA", "AUDITOR_LGPD", "ADMIN_SISTEMA", "Gestor", "Coordenador", "Tecnico_CRAS", "Tecnico_UBS", "Admin"] },
    { href: "/painel", label: "Painel Territorial", icon: Map, roles: ["GESTOR_OPERACIONAL", "COORDENADOR_UNIDADE", "TECNICO_REFERENCIA", "Admin", "Gestor", "Coordenador"] },
    { href: "/listas", label: "Listas Inteligentes", icon: List, roles: ["COORDENADOR_UNIDADE", "TECNICO_REFERENCIA", "Coordenador", "Tecnico_CRAS", "Tecnico_UBS"] },
    { href: "/busca-ativa", label: "Busca Ativa", icon: Search, roles: ["COORDENADOR_UNIDADE", "TECNICO_REFERENCIA", "Coordenador", "Tecnico_CRAS", "Tecnico_UBS"] },
    { href: "/relatorios", label: "Relatórios", icon: BarChart2, roles: ["SECRETARIO_MUNICIPAL", "GESTOR_OPERACIONAL", "AUDITOR_LGPD", "Admin", "Gestor"] },
    { href: "/configuracoes", label: "Configurações", icon: Settings, roles: ["ADMIN_SISTEMA", "Admin"] },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        async function getProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from("usuarios")
                    .select("perfil")
                    .eq("id", user.id)
                    .single();
                setProfile(data);
            }
        }
        getProfile();
    }, []);

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push("/login");
    }

    const filteredNavItems = navItems.filter(item =>
        !profile || item.roles.includes(profile.perfil)
    );

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
                {filteredNavItems.map(({ href, label, icon: Icon }) => {
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
