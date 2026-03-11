"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getRiscBadgeClass, formatDate } from "@/lib/utils";
import type { FamiliaScore, RiscLevel } from "@/lib/supabase/types";
import { Search, Filter, Download, RefreshCw, ChevronUp, ChevronDown } from "lucide-react";

export default function ListasInteligentesPage() {
    const supabase = createClient();
    const [user, setUser] = useState<any>(null);
    const [familias, setFamilias] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filtroClassif, setFiltroClassif] = useState<RiscLevel | "">("");
    const [filtroTerritorio, setFiltroTerritorio] = useState("");
    const [territorios, setTerritorios] = useState<{ id: string; nome: string }[]>([]);
    const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
    const [page, setPage] = useState(0);
    const PAGE_SIZE = 20;

    useEffect(() => {
        async function getProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from("usuarios").select("*, perfil").eq("id", user.id).single();
                setUser(data);
            }
        }
        getProfile();
    }, []);

    const loadData = useCallback(async () => {
        if (!user) return;
        setLoading(true);

        const isStrategic = ["SECRETARIO_MUNICIPAL", "GESTOR_OPERACIONAL", "Gestor"].includes(user.perfil);
        const viewName = isStrategic ? "vw_familias_pseudonimizada" : "vw_familias_nominativa";

        let query = supabase.from(viewName).select("*");

        if (filtroClassif) query = query.eq("classificacao_risco", filtroClassif);
        if (filtroTerritorio) query = query.eq("territorio_id", filtroTerritorio);

        // Handle search differently for pseudonimized view
        if (search && !isStrategic) {
            query = query.ilike("nome", `%${search}%`);
        }

        query = query.order("score_familiar", { ascending: sortDir === "asc" })
            .not("score_familiar", "is", null)
            .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

        const { data } = await query;
        if (data) setFamilias(data);
        setLoading(false);
    }, [user, filtroClassif, filtroTerritorio, search, sortDir, page]);

    useEffect(() => { loadData(); }, [loadData]);

    useEffect(() => {
        supabase.from("territorios").select("id, nome").then(({ data }) => {
            if (data) setTerritorios(data);
        });
    }, []);

    async function exportCSV() {
        const rows = [
            ["Família", "Território", "Score Social", "Score Saúde", "Score Familiar", "Classificação", "Ação", "Última Atualização"],
            ...familias.map(f => [
                f.nome || f.identificador, f.territorio,
                f.score_social?.toFixed(2), f.score_saude?.toFixed(2),
                f.score_familiar?.toFixed(2), f.classificacao_risco,
                f.acao_recomendada, formatDate(f.data_recalculo),
            ])
        ];
        const csv = rows.map(r => r.join(";")).join("\n");
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url;
        a.download = `listas-inteligentes-${filtroClassif || "todas"}.csv`; a.click();
    }

    const riscLevels: RiscLevel[] = ["CRÍTICA", "ALTA", "MODERADA", "BAIXA"];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Listas Inteligentes</h1>
                    <p className="text-gray-500 mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        Famílias ordenadas por Score de Risco
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={loadData} className="btn-secondary shadow-sm" disabled={loading}>
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        Atualizar
                    </button>
                    <button onClick={exportCSV} className="btn-primary shadow-lg shadow-blue-500/20">
                        <Download size={16} /> Exportar CSV
                    </button>
                </div>
            </div>

            {/* Filters bar */}
            <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                    {["", ...riscLevels].map(level => (
                        <button key={level || "todas"}
                            onClick={() => { setFiltroClassif(level as RiscLevel | ""); setPage(0); }}
                            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 border ${filtroClassif === level
                                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25 scale-105"
                                : "bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600 shadow-sm"
                                }`}>
                            {level || "TODAS AS FAMÍLIAS"}
                        </button>
                    ))}
                </div>

                <div className="card p-2 flex flex-wrap gap-2 items-center bg-gray-50/50">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input className="input !bg-white pl-12 h-12" placeholder="Pesquisar por nome do responsável..."
                            value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
                    </div>
                    <select className="input !bg-white w-64 h-12" value={filtroTerritorio}
                        onChange={e => { setFiltroTerritorio(e.target.value); setPage(0); }}>
                        <option value="">Todos os territórios</option>
                        {territorios.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                    </select>
                    <button onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")}
                        className="btn-secondary h-12 px-6">
                        <Filter size={16} />
                        Score {sortDir === "desc" ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                            {["#", "Família", "Território", "Score Social", "Score Saúde", "Score Familiar", "Classificação", "Ação Recomendada", "Atualizado em"].map(h => (
                                <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={9} className="py-12 text-center text-gray-400">
                                <RefreshCw size={18} className="animate-spin mx-auto mb-2" />Carregando...
                            </td></tr>
                        ) : familias.length === 0 ? (
                            <tr><td colSpan={9} className="py-12 text-center text-gray-400">
                                Nenhuma família com score encontrada para os filtros selecionados.
                            </td></tr>
                        ) : familias.map((f, i) => (
                            <tr key={f.familia_id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-gray-400 text-xs">{page * PAGE_SIZE + i + 1}</td>
                                <td className="px-4 py-3 font-medium text-gray-900">
                                    <div className="flex flex-col">
                                        <span>{f.nome || f.identificador}</span>
                                        {f.case_id && <span className="text-[10px] text-gray-400 font-mono">{f.case_id}</span>}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-gray-600">{f.territorio}</td>
                                <td className="px-4 py-3 font-mono text-blue-700">{f.score_social?.toFixed(2) ?? "—"}</td>
                                <td className="px-4 py-3 font-mono text-purple-700">{f.score_saude?.toFixed(2) ?? "—"}</td>
                                <td className="px-4 py-3">
                                    <span className="font-bold text-lg"
                                        style={{ color: f.score_familiar && f.score_familiar >= 8.5 ? "#DC2626" : f.score_familiar && f.score_familiar >= 6.5 ? "#F97316" : "#16a34a" }}>
                                        {f.score_familiar?.toFixed(2) ?? "—"}
                                    </span>
                                    {f.gatilhos_ativos && (
                                        <div className="text-[10px] text-red-500 font-medium leading-tight mt-0.5 max-w-[150px]">
                                            {f.gatilhos_ativos}
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={getRiscBadgeClass(f.classificacao_risco)}>
                                        {f.classificacao_risco ?? "—"}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-600 text-xs max-w-40 truncate">{f.acao_recomendada ?? "—"}</td>
                                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{formatDate(f.data_recalculo)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                        Mostrando {page * PAGE_SIZE + 1}–{page * PAGE_SIZE + familias.length}
                    </span>
                    <div className="flex gap-2">
                        <button className="btn-secondary py-1 px-3 text-xs" disabled={page === 0}
                            onClick={() => setPage(p => p - 1)}>Anterior</button>
                        <button className="btn-secondary py-1 px-3 text-xs" disabled={familias.length < PAGE_SIZE}
                            onClick={() => setPage(p => p + 1)}>Próxima</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
