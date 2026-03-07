"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { KpiDashboard } from "@/lib/supabase/types";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from "recharts";
import { MapPin, Users, AlertTriangle, TrendingUp, Award, RefreshCw } from "lucide-react";

const RISK_COLORS: Record<string, string> = {
    CRÍTICA: "#ef4444",
    ALTA: "#f97316",
    MODERADA: "#eab308",
    BAIXA: "#22c55e",
};

export default function PainelTerritorialPage() {
    const supabase = createClient();
    const [kpis, setKpis] = useState<KpiDashboard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        setLoading(true);
        const { data } = await supabase.from("vw_kpis_dashboard").select("*");
        if (data) setKpis(data as KpiDashboard[]);
        setLoading(false);
    }

    const totalFamilias = kpis.reduce((s, k) => s + (k.total_familias || 0), 0);
    const totalCriticas = kpis.reduce((s, k) => s + (k.criticas || 0), 0);
    const totalAltas = kpis.reduce((s, k) => s + (k.altas || 0), 0);
    const totalModeradas = kpis.reduce((s, k) => s + (k.moderadas || 0), 0);

    const barData = kpis.map(k => ({
        name: k.territorio,
        Crítica: k.criticas,
        Alta: k.altas,
        Moderada: k.moderadas,
        Baixa: k.baixas,
    }));

    const pieData = [
        { name: "Crítica", value: totalCriticas },
        { name: "Alta", value: totalAltas },
        { name: "Moderada", value: totalModeradas },
        { name: "Baixa", value: kpis.reduce((s, k) => s + (k.baixas || 0), 0) },
    ].filter(d => d.value > 0);

    if (loading) return (
        <div className="flex items-center justify-center h-full min-h-[60vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Painel Territorial</h1>
                    <p className="text-gray-500 mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Distribuição de risco por território — Mauá
                    </p>
                </div>
                <button onClick={loadData} className="btn-secondary shadow-sm">
                    <RefreshCw size={16} />
                    Atualizar
                </button>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard label="Total de Famílias" value={totalFamilias.toLocaleString("pt-BR")} icon={<Users size={22} />} color="blue" />
                <KpiCard label="Prioridade Crítica" value={totalCriticas.toLocaleString("pt-BR")} icon={<AlertTriangle size={22} />} color="red" sub="Ação em 48h" />
                <KpiCard label="Prioridade Alta" value={totalAltas.toLocaleString("pt-BR")} icon={<TrendingUp size={22} />} color="orange" sub="Visita em 15 dias" />
                <KpiCard label="Prioridade Moderada" value={totalModeradas.toLocaleString("pt-BR")} icon={<Award size={22} />} color="yellow" sub="Acompanhamento" />
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-5 gap-6">
                <div className="card p-5 lg:col-span-2">
                    <h2 className="font-semibold text-gray-800 mb-4">Distribuição por Risco</h2>
                    <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                                dataKey="value" nameKey="name" paddingAngle={2}>
                                {pieData.map(entry => (
                                    <Cell key={entry.name} fill={RISK_COLORS[entry.name] || "#94a3b8"} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(v) => [v, "Famílias"]} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="card p-5 lg:col-span-3">
                    <h2 className="font-semibold text-gray-800 mb-4">Risco por Território</h2>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="Crítica" stackId="a" fill="#DC2626" />
                            <Bar dataKey="Alta" stackId="a" fill="#F97316" />
                            <Bar dataKey="Moderada" stackId="a" fill="#FACC15" />
                            <Bar dataKey="Baixa" stackId="a" fill="#22C55E" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Territory table */}
            <div className="card">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-800">Resumo por Território</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                {["Território", "Total", "Crítica", "Alta", "Moderada", "Baixa", "% de Risco"].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {kpis.map(k => {
                                const pct = k.total_familias > 0
                                    ? (((k.criticas + k.altas) / k.total_familias) * 100).toFixed(1)
                                    : "0.0";
                                const pctNum = parseFloat(pct);
                                return (
                                    <tr key={k.territorio} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                                            <MapPin size={14} className="text-blue-500 shrink-0" />
                                            {k.territorio}
                                        </td>
                                        <td className="px-4 py-3 font-bold text-gray-900">{k.total_familias.toLocaleString("pt-BR")}</td>
                                        <td className="px-4 py-3">
                                            <span className="badge-critica">{k.criticas}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="badge-alta">{k.altas}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="badge-moderada">{k.moderadas}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="badge-baixa">{k.baixas}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 bg-gray-100 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${pctNum >= 20 ? "bg-red-500" : pctNum >= 10 ? "bg-orange-400" : "bg-green-500"}`}
                                                        style={{ width: `${Math.min(pctNum * 5, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-gray-600">{pct}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
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
    const colorMap: Record<string, { bg: string; iconBg: string }> = {
        blue: { bg: "bg-blue-600", iconBg: "bg-white/20" },
        red: { bg: "bg-red-500", iconBg: "bg-white/20" },
        orange: { bg: "bg-orange-500", iconBg: "bg-white/20" },
        yellow: { bg: "bg-amber-500", iconBg: "bg-white/20" },
    };
    const c = colorMap[color] || colorMap.blue;
    return (
        <div className={`relative overflow-hidden group hover-lift rounded-2xl p-6 shadow-lg ${c.bg} text-white`}>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">{icon}</div>
            <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-80">{label}</p>
                    <div className={`p-2.5 rounded-xl ${c.iconBg} backdrop-blur-sm shadow-inner`}>{icon}</div>
                </div>
                <div className="mt-4">
                    <p className="text-3xl font-black tracking-tight">{value}</p>
                    {sub && <p className="text-[10px] mt-1 font-medium opacity-90 uppercase tracking-wide">{sub}</p>}
                </div>
            </div>
        </div>
    );
}
