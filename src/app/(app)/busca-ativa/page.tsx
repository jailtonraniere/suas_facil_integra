"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getRiscBadgeClass, formatDate } from "@/lib/utils";
import type { FamiliaScore } from "@/lib/supabase/types";
import { Search, Plus, ClipboardList, CheckCircle2 } from "lucide-react";

type BuscaAtiva = {
    id: string; territorio_id: string; data_inicio: string; status: string;
    resultado?: string; score_risco_lista_usada?: string;
    territorios?: { nome: string };
};

export default function BuscaAtivaPage() {
    const supabase = createClient();
    const [user, setUser] = useState<any>(null);
    const [buscas, setBuscas] = useState<BuscaAtiva[]>([]);
    const [familiasCriticas, setFamiliasCriticas] = useState<any[]>([]);
    const [territorios, setTerritorios] = useState<{ id: string; nome: string }[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form state
    const [territId, setTerritId] = useState("");
    const [dataInicio, setDataInicio] = useState("");
    const [filtroClassif, setFiltroClassif] = useState("CRÍTICA");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function getProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from("usuarios").select("*, perfil").eq("id", user.id).single();
                setUser(data);
            }
        }
        getProfile().then(() => loadData());
    }, []);

    async function loadData() {
        setLoading(true);
        // We need the profile to know which view to use
        const { data: { user: authUser } } = await supabase.auth.getUser();
        let currentProfile = user;
        if (!currentProfile && authUser) {
            const { data } = await supabase.from("usuarios").select("*, perfil").eq("id", authUser.id).single();
            currentProfile = data;
            setUser(data);
        }

        if (!currentProfile) {
            setLoading(false);
            return;
        }

        const isStrategic = ["SECRETARIO_MUNICIPAL", "GESTOR_OPERACIONAL", "Gestor"].includes(currentProfile.perfil);
        const viewName = isStrategic ? "vw_familias_pseudonimizada" : "vw_familias_nominativa";

        const [{ data: b }, { data: f }, { data: t }] = await Promise.all([
            supabase.from("buscas_ativas").select("*, territorios(nome)").order("criado_em", { ascending: false }).limit(20),
            supabase.from(viewName).select("*").eq("classificacao_risco", "CRÍTICA").order("score_familiar", { ascending: false }).limit(50),
            supabase.from("territorios").select("id, nome"),
        ]);
        if (b) setBuscas(b as BuscaAtiva[]);
        if (f) setFamiliasCriticas(f);
        if (t) setTerritorios(t);
        setLoading(false);
    }

    async function criarBusca(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("buscas_ativas") as any).insert({
            territorio_id: territId, data_inicio: dataInicio,
            status: "Planejada", score_risco_lista_usada: filtroClassif,
        });
        setSaving(false);
        setShowForm(false);
        loadData();
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-blue-900 tracking-tight">Busca Ativa</h1>
                    <p className="text-gray-500 mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        Planejamento e execução de visitas priorizadas por Score
                    </p>
                </div>
                <button onClick={() => setShowForm(s => !s)} className="btn-primary shadow-lg shadow-blue-500/20 w-full sm:w-auto justify-center">
                    <Plus size={18} /> Nova Busca Ativa
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="card p-5 md:p-8 border-blue-100 bg-gradient-to-b from-white to-blue-50/30">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                            <Plus size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Criar Nova Busca Ativa</h2>
                    </div>
                    <form onSubmit={criarBusca} className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Território</label>
                                <select className="input" required value={territId} onChange={e => setTerritId(e.target.value)}>
                                    <option value="">Selecionar…</option>
                                    {territorios.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Data de Início</label>
                                <input className="input" type="date" required value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Lista Inteligente</label>
                                <select className="input" value={filtroClassif} onChange={e => setFiltroClassif(e.target.value)}>
                                    {["CRÍTICA", "ALTA", "MODERADA", "BAIXA"].map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button type="button" className="btn-secondary px-6" onClick={() => setShowForm(false)}>Cancelar</button>
                            <button type="submit" className="btn-primary px-8" disabled={saving}>
                                {saving ? "Salvando…" : "Confirmar Planejamento"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Families to visit (Crítica) */}
            <div className="card shadow-xl border-red-50">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                            <Search size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900">Prioridade Crítica — Busca Imediata</h2>
                            <p className="text-xs text-gray-500">Famílias que requerem atenção nas próximas 48h</p>
                        </div>
                    </div>
                    <span className="bg-red-500 text-white rounded-full px-4 py-1.5 text-xs font-black shadow-lg shadow-red-500/30">
                        {familiasCriticas.length} FAMÍLIAS
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                {["Família", "Endereço", "Território", "Score", "Classificação", "Última Atualização"].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {familiasCriticas.map(f => (
                                <tr key={f.familia_id || f.case_id} className="hover:bg-red-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        <div className="flex flex-col">
                                            <span>{f.nome || f.identificador}</span>
                                            {f.case_id && <span className="text-[10px] text-gray-400 font-mono">{f.case_id}</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">
                                        {f.logradouro ? `${f.logradouro}${f.numero ? `, ${f.numero}` : ""}` : "—"}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{f.territorio}</td>
                                    <td className="px-4 py-3 font-bold text-red-700">{f.score_familiar?.toFixed(2)}</td>
                                    <td className="px-4 py-3"><span className={getRiscBadgeClass(f.classificacao_risco)}>{f.classificacao_risco}</span></td>
                                    <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(f.data_recalculo)}</td>
                                </tr>
                            ))}
                            {familiasCriticas.length === 0 && !loading && (
                                <tr><td colSpan={6} className="py-8 text-center text-gray-400">
                                    Nenhuma família com prioridade crítica no momento.
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Existing Searches */}
            <div className="card">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <ClipboardList size={20} />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900">Histórico de Buscas Ativas</h2>
                        <p className="text-xs text-gray-500">Registro de missões planejadas e concluídas</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                {["Território", "Data Início", "Lista Usada", "Status", "Resultado"].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {buscas.map(b => (
                                <tr key={b.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{b.territorios?.nome || "—"}</td>
                                    <td className="px-4 py-3 text-gray-600">{formatDate(b.data_inicio)}</td>
                                    <td className="px-4 py-3"><span className={getRiscBadgeClass(b.score_risco_lista_usada)}>{b.score_risco_lista_usada || "—"}</span></td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${b.status === "Concluída" ? "text-green-700" : b.status === "Em Andamento" ? "text-blue-700" : "text-gray-500"
                                            }`}>
                                            {b.status === "Concluída" && <CheckCircle2 size={13} />}
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{b.resultado || "—"}</td>
                                </tr>
                            ))}
                            {buscas.length === 0 && (
                                <tr><td colSpan={5} className="py-8 text-center text-gray-400">Nenhuma busca ativa registrada.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
