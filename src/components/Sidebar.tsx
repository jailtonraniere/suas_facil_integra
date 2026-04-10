"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { normalizeProfile, PROFILE_LABELS, isSuasFacilTeam } from "@/lib/utils";
import {
    LayoutDashboard, Map, List, Search, BarChart2,
    Settings, LogOut, ChevronRight, HelpCircle, Shield, X
} from "lucide-react";

const navItems = [
    {
        href: "/dashboard",   label: "Dashboard",         icon: LayoutDashboard,
        roles: ["SECRETARIO_MUNICIPAL", "GESTOR_OPERACIONAL", "COORDENADOR_UNIDADE", "TECNICO_REFERENCIA", "AUDITOR_LGPD", "ADMIN_SISTEMA", "Admin", "Gestor", "Coordenador", "Tecnico_CRAS", "Tecnico_UBS"],
    },
    {
        href: "/painel",      label: "Painel Territorial", icon: Map,
        roles: ["SECRETARIO_MUNICIPAL", "GESTOR_OPERACIONAL", "COORDENADOR_UNIDADE", "TECNICO_REFERENCIA", "Admin", "Gestor", "Coordenador", "Tecnico_CRAS", "Tecnico_UBS"],
    },
    {
        href: "/listas",      label: "Listas Inteligentes", icon: List,
        roles: ["GESTOR_OPERACIONAL", "COORDENADOR_UNIDADE", "TECNICO_REFERENCIA", "ADMIN_SISTEMA", "Admin", "Gestor", "Coordenador", "Tecnico_CRAS", "Tecnico_UBS"],
    },
    {
        href: "/busca-ativa", label: "Busca Ativa",        icon: Search,
        roles: ["GESTOR_OPERACIONAL", "COORDENADOR_UNIDADE", "TECNICO_REFERENCIA", "ADMIN_SISTEMA", "Admin", "Gestor", "Coordenador", "Tecnico_CRAS", "Tecnico_UBS"],
    },
    {
        href: "/relatorios",  label: "Relatórios",         icon: BarChart2,
        roles: ["SECRETARIO_MUNICIPAL", "GESTOR_OPERACIONAL", "AUDITOR_LGPD", "ADMIN_SISTEMA", "Admin", "Gestor"],
    },
    {
        href: "/configuracoes", label: "Configurações",   icon: Settings,
        roles: ["ADMIN_SISTEMA", "SECRETARIO_MUNICIPAL", "Admin"],
    },
    {
        href: "/ajuda",       label: "Ajuda",              icon: HelpCircle,
        roles: ["SECRETARIO_MUNICIPAL", "GESTOR_OPERACIONAL", "COORDENADOR_UNIDADE", "TECNICO_REFERENCIA", "AUDITOR_LGPD", "ADMIN_SISTEMA", "Admin", "Gestor", "Coordenador", "Tecnico_CRAS", "Tecnico_UBS"],
    },
];

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
    const pathname  = usePathname();
    const router    = useRouter();
    const supabase  = createClient();
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
    const isSuperUser     = isSuasFacilTeam(profile?.perfil);

    // Super Admin e Suporte SUAS Fácil veem TUDO.
    // Demais perfis têm filtro de roles.
    const filteredNavItems = loadingProfile
        ? []
        : isSuperUser
            ? navItems                                                     // acesso irrestrito
            : navItems.filter(item => item.roles.includes(canonicalPerfil));

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50
                w-64 min-h-screen bg-[#1e3a8a] flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
            `}>
                {/* Brand */}
                <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center justify-center flex-1">
                        <img
                            src="/logo_full.png"
                            alt="SUAS Fácil Integra"
                            className="h-12 w-auto object-contain bg-white rounded-lg px-2 py-1"
                        />
                    </div>
                    {/* Close button mobile only */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1.5 rounded-lg text-blue-200 hover:bg-blue-800 hover:text-white transition-colors ml-2"
                        aria-label="Fechar menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Badge exclusivo equipe SUAS Fácil */}
                {!loadingProfile && isSuperUser && (
                    <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center gap-2">
                        <Shield size={14} className="text-amber-400 shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
                            Equipe SUAS Fácil
                        </span>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {filteredNavItems.map(({ href, label, icon: Icon }) => {
                        const active = pathname.startsWith(href);
                        return (
                            <Link key={href} href={href} onClick={onClose}
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

                {/* Perfil + Logout */}
                <div className="px-3 py-4 border-t border-blue-800 space-y-2">
                    {!loadingProfile && canonicalPerfil && (
                        <div className={`px-3 py-2 rounded-lg ${isSuperUser ? "bg-amber-500/10 border border-amber-400/20" : "bg-blue-900/50"}`}>
                            <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${isSuperUser ? "text-amber-400" : "text-blue-400"}`}>
                                Perfil
                            </p>
                            <p className={`text-xs font-semibold truncate ${isSuperUser ? "text-amber-200" : "text-blue-100"}`}>
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
        </>
    );
}
