"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { normalizeProfile, PROFILE_LABELS } from "@/lib/utils";
import {
    LayoutDashboard, Map, List, Search, BarChart2,
    Settings, LogOut, ChevronRight, HelpCircle
} from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["SECRETARIO_MUNICIPAL", "GESTOR_OPERACIONAL", "COORDENADOR_UNIDADE", "TECNICO_REFERENCIA", "AUDITOR_LGPD", "ADMIN_SISTEMA", "Gestor", "Coordenador", "Tecnico_CRAS", "Tecnico_UBS", "Admin"] },
    { href: "/painel", label: "Painel Territorial", icon: Map, roles: ["GESTOR_OPERACIONAL", "COORDENADOR_UNIDADE", "TECNICO_REFERENCIA", "Admin", "Gestor", "Coordenador"] },
    { href: "/listas", label: "Listas Inteligentes", icon: List, roles: ["GESTOR_OPERACIONAL", "COORDENADOR_UNIDADE", "TECNICO_REFERENCIA", "ADMIN_SISTEMA", "Admin", "Gestor", "Coordenador", "Tecnico_CRAS", "Tecnico_UBS"] },
    { href: "/busca-ativa", label: "Busca Ativa", icon: Search, roles: ["GESTOR_OPERACIONAL", "COORDENADOR_UNIDADE", "TECNICO_REFERENCIA", "ADMIN_SISTEMA", "Admin", "Gestor", "Coordenador", "Tecnico_CRAS", "Tecnico_UBS"] },
    { href: "/relatorios", label: "Relatórios", icon: BarChart2, roles: ["SECRETARIO_MUNICIPAL", "GESTOR_OPERACIONAL", "AUDITOR_LGPD", "ADMIN_SISTEMA", "Admin", "Gestor"] },
    { href: "/configuracoes", label: "Configurações", icon: Settings, roles: ["ADMIN_SISTEMA", "Admin"] },
    { href: "/ajuda", label: "Ajuda", icon: HelpCircle, roles: ["SECRETARIO_MUNICIPAL", "GESTOR_OPERACIONAL", "COORDENADOR_UNIDADE", "TECNICO_REFERENCIA", "AUDITOR_LGPD", "ADMIN_SISTEMA", "Gestor", "Coordenador", "Tecnico_CRAS", "Tecnico_UBS", "Admin"] },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [profile, setProfile] = useState<any>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    useEffect(() => {
        async function getProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from("usuarios")
                    .select("perfil, nome")
                    .eq("id", user.id)
                    .single();
                setProfile(data);
            }
            setLoadingProfile(false);
        }
        getProfile();
    }, []);

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push("/login");
    }

    const canonicalPerfil = normalizeProfile(profile?.perfil);

    // Aguarda o perfil carregar antes de filtrar: evita exibir todos os menus
    // temporariamente enquanto a consulta ao banco ainda não retornou.
    const filteredNavItems = loadingProfile
        ? []
        : navItems.filter(item => item.roles.includes(canonicalPerfil));

    return (
        <aside className="w-64 min-h-screen bg-[#1e3a8a] flex flex-col">
            {/* Brand */}
            <div className="px-6 py-5 border-b border-white/10">
                <div className="flex items-center justify-center">
                    <img
                        src="/logo_full.png"
                        alt="SUAS Fácil Integra"
                        className="h-12 w-auto object-contain bg-white rounded-lg px-2 py-1"
                    />
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
            <div className="px-3 py-4 border-t border-blue-800 space-y-2">
                {/* Label do perfil atual */}
                {!loadingProfile && canonicalPerfil && (
                    <div className="px-3 py-2 rounded-lg bg-blue-900/50">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-0.5">Perfil</p>
                        <p className="text-xs font-semibold text-blue-100 truncate">
                            {PROFILE_LABELS[canonicalPerfil] ?? canonicalPerfil}
                        </p>
                    </div>
                )}
                <button onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-blue-200 hover:bg-blue-800 hover:text-white transition-colors">
                    <LogOut size={18} />
                    Sair
                </button>
            </div>
        </aside>
    );
}
