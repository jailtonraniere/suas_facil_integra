"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getRiscBadgeClass, formatDate, scoreBar, normalizeProfile, PROFILE_LABELS } from "@/lib/utils";
import type { KpiDashboard, FamiliaScore } from "@/lib/supabase/types";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";
import { AlertTriangle, Users, TrendingUp, Award, RefreshCw } from "lucide-react";

const RISK_COLORS = { CRÍTICA: "#ef4444", ALTA: "#f97316", MODERADA: "#eab308", BAIXA: "#22c55e" };
const BRAND_GRADIENT = "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)";

export default function DashboardPage() {
    const supabase = createClient();
    const [user, setUser] = useState<any>(null);
    const [kpis, setKpis] = useState<KpiDashboard[]>([]);
    const [topFamilias, setTopFamilias] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [recalcLoading, setRecalcLoading] = useState(false);

    useEffect(() => { loadInitialData(); }, []);

    async function loadInitialData() {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase
                .from("usuarios")
                .select("*, municipio:municipios(nome)")
                .eq("id", user.id)
                .single();
            setUser({ ...user, profile });
            await loadDashboardData(profile);
        }
        setLoading(false);
    }

    async function loadDashboardData(profile: any) {
        const perfil = normalizeProfile(profile?.perfil);
        const isStrategic = ["SECRETARIO_MUNICIPAL", "GESTOR_OPERACIONAL"].includes(perfil);
        const isOperational = ["COORDENADOR_UNIDADE", "TECNICO_REFERENCIA"].includes(perfil);

        const kpiQuery = supabase.from("vw_kpis_dashboard_v2").select("*");

        // Apply scoping to KPIs for operational/territorial roles
        if (isOperational && profile.scope_territorio?.length > 0) {
            kpiQuery.in("territorio_id", profile.scope_territorio);
        }

        const familiesQuery = isStrategic
            ? supabase.from("vw_familias_pseudonimizada").select("*")
            : supabase.from("vw_familias_nominativa").select("*");

        if (isOperational && profile.scope_territorio?.length > 0) {
            familiesQuery.in("territorio_id", profile.scope_territorio);
        }

        const [{ data: k }, { data: f }] = await Promise.all([
            kpiQuery,
            familiesQuery.order("score_familiar", { ascending: false }).limit(10),
        ]);

        if (k) setKpis(k);
        if (f) setTopFamilias(f);
    }

    async function handleRecalcular() {
        setRecalcLoading(true);
        await fetch("/api/recalcular", { method: "POST" });
        await loadDashboardData(user?.profile);
        setRecalcLoading(false);
    }

    const totalFamilias = kpis.reduce((s, k) => s + (k.total_familias || 0), 0);
    const totalCriticas = kpis.reduce((s, k) => s + (k.criticas || 0), 0);
    const totalAltas = kpis.reduce((s, k) => s + (k.altas || 0), 0);
    const totalSemScore = kpis.reduce((s, k) => s + (k.sem_score || 0), 0);

    const pieData = [
        { name: "Crítica", value: totalCriticas },
        { name: "Alta", value: totalAltas },
        { name: "Moderada", value: kpis.reduce((s, k) => s + (k.moderadas || 0), 0) },
        { name: "Baixa", value: kpis.reduce((s, k) => s + (k.baixas || 0), 0) },
    ].filter(d => d.value > 0);

    const barData = kpis.slice(0, 8).map(k => ({
        name: k.territorio.length > 12 ? k.territorio.slice(0, 12) + "…" : k.territorio,
        Crítica: k.criticas, Alta: k.altas, Moderada: k.moderadas, Baixa: k.baixas,
    }));

    if (loading) return (
        <div className="flex items-center justify-center h-full min-h-[60vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
    );

    const canonicalPerfil = normalizeProfile(user?.profile?.perfil);
    const profileLabel = PROFILE_LABELS[canonicalPerfil] || user?.profile?.perfil || "Usuário";
    const isStrategic = ["SECRETARIO_MUNICIPAL", "GESTOR_OPERACIONAL"].includes(canonicalPerfil);

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-blue-900 tracking-tight">
                        {isStrategic ? "Dashboard Executivo" : "Dashboard Operacional"}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs md:text-sm">
                        <p className="text-gray-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                            Olá, <span className="text-blue-900">{user?.profile?.nome || "Usuário"}</span>
                        </p>
                        <p className="text-gray-500 text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Perfil: <span className="font-semibold text-blue-700">{profileLabel}</span>
                        </p>
                        <p className="text-gray-500 text-sm flex items-center gap-2">
                            Território: <span className="font-semibold text-gray-700">{user?.profile?.municipio?.nome || "Mauá"}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 font-medium bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                        Última atualização: {new Date().toLocaleDateString("pt-BR")}
                    </span>
                    {["ADMIN_SISTEMA", "GESTOR_OPERACIONAL"].includes(normalizeProfile(user?.profile?.perfil)) && (
                        <button onClick={handleRecalcular} disabled={recalcLoading} className="btn-secondary shadow-sm">
                            <RefreshCw size={16} className={recalcLoading ? "animate-spin" : ""} />
                            Recalcular
                        </button>
                    )}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <KpiCard label="Total de Famílias" value={totalFamilias.toLocaleString("pt-BR")}
                    icon={<Users size={22} />} color="blue" />
                <KpiCard label="Prioridade Crítica" value={totalCriticas.toLocaleString("pt-BR")}
                    icon={<AlertTriangle size={22} />} color="red"
                    sub="Ação imediata (48h)" />
                <KpiCard label="Prioridade Alta" value={totalAltas.toLocaleString("pt-BR")}
                    icon={<TrendingUp size={22} />} color="orange"
                    sub="Visita em 15 dias" />
                <KpiCard label="Prioridade Moderada" value={kpis.reduce((s, k) => s + (k.moderadas || 0), 0).toLocaleString("pt-BR")}
                    icon={<Award size={22} />} color="yellow"
                    sub="Acompanhamento" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
                {/* Pie */}
                <div className="card p-4 md:p-5 lg:col-span-2">
                    <h2 className="font-semibold text-gray-800 mb-3 md:mb-4 text-sm md:text-base">Distribuição por Risco</h2>
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                                dataKey="value" nameKey="name" paddingAngle={2}>
                                {pieData.map((entry) => (
                                    <Cell key={entry.name}
                                        fill={RISK_COLORS[entry.name as keyof typeof RISK_COLORS] || "#94a3b8"} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(v) => [v, "Famílias"]} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Bar */}
                <div className="card p-4 md:p-5 lg:col-span-3">
                    <h2 className="font-semibold text-gray-800 mb-3 md:mb-4 text-sm md:text-base">Risco por Território</h2>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="Crítica" stackId="a" fill="#DC2626" />
                            <Bar dataKey="Alta" stackId="a" fill="#F97316" />
                            <Bar dataKey="Moderada" stackId="a" fill="#FACC15" />
                            <Bar dataKey="Baixa" stackId="a" fill="#22C55E" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top 10 Famílias */}
            <div className="card">
                <div className="px-4 md:px-5 py-3 md:py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-800 text-sm md:text-base">Top 10 Famílias — Maior Score</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                {[isStrategic ? "Caso (ID)" : "Família", "Território", "Score Social", "Score Saúde", "Score Familiar", "Classificação", "Ação"].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {topFamilias.map((f) => {
                                const id = isStrategic ? f.case_id : f.familia_id;
                                const displayName = isStrategic ? `Família #${f.case_id.slice(0, 8)}` : f.nome_responsavel;

                                return (
                                    <tr key={id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {displayName}
                                            {isStrategic && f.marcador_social_critico && (
                                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xxs font-medium bg-red-100 text-red-800">
                                                    Vulnerabilidade
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{f.territorio}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                                    <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${scoreBar(f.score_social || 0)}%` }} />
                                                </div>
                                                <span className="text-xs text-gray-600">{f.score_social?.toFixed(1) || "—"}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                                    <div className="h-1.5 rounded-full bg-purple-500" style={{ width: `${scoreBar(f.score_saude || 0)}%` }} />
                                                </div>
                                                <span className="text-xs text-gray-600">{f.score_saude?.toFixed(1) || "—"}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-bold text-gray-900">{f.score_familiar?.toFixed(2) || "—"}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={getRiscBadgeClass(f.classificacao_risco)}>
                                                {f.classificacao_risco || "—"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 text-xs max-w-32 truncate">
                                            {f.acao_recomendada || "—"}
                                        </td>
                                    </tr>
                                );
                            })}
                            {topFamilias.length === 0 && (
                                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                                    Nenhuma família encontrada. Importe dados para começar.
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function KpiCard({ label, value, icon, color, sub }: {
    label: string; value: string; icon: React.ReactNode; color: string; sub?: string;
}) {
    const colorMap: Record<string, { bg: string, text: string, iconBg: string }> = {
        blue: { bg: "bg-blue-600", text: "text-white", iconBg: "bg-white/20" },
        red: { bg: "bg-red-500", text: "text-white", iconBg: "bg-white/20" },
        orange: { bg: "bg-orange-500", text: "text-white", iconBg: "bg-white/20" },
        yellow: { bg: "bg-amber-500", text: "text-white", iconBg: "bg-white/20" },
    };

    const c = colorMap[color] || colorMap.blue;

    return (
        <div className={`relative overflow-hidden group hover-lift rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg ${c.bg} ${c.text}`}>
            {/* Background Pattern */}
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                {icon}
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-start justify-between">
                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-80 leading-tight">{label}</p>
                    <div className={`p-2.5 rounded-xl ${c.iconBg} backdrop-blur-sm shadow-inner`}>
                        {icon}
                    </div>
                </div>

                <div className="mt-4">
                    <p className="text-xl md:text-3xl font-black tracking-tight">{value}</p>
                    {sub && <p className="text-[10px] mt-1 font-medium opacity-90 uppercase tracking-wide">{sub}</p>}
                </div>
            </div>
        </div>
    );
}
