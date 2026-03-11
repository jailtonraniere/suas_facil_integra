"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Download } from "lucide-react";

type ImportStatus = "idle" | "processing" | "done" | "error";

export default function RelatoriosPage() {
    const supabase = createClient();
    const [user, setUser] = useState<any>(null);
    const [file, setFile] = useState<File | null>(null);
    const [tipo, setTipo] = useState<"CadUnico" | "eSUS">("CadUnico");
    const [status, setStatus] = useState<ImportStatus>("idle");
    const [message, setMessage] = useState("");

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

    const canImport = user && ["ADMIN_SISTEMA", "Admin", "GESTOR_OPERACIONAL"].includes(user.perfil);
    const canSeeAudit = user && ["ADMIN_SISTEMA", "Admin", "AUDITOR_LGPD"].includes(user.perfil);

    async function handleImport(e: React.FormEvent) {
        e.preventDefault();
        if (!file) return;
        setStatus("processing");
        setMessage("Processando importação...");
        try {
            // Invoke Edge Function via Supabase invoke
            const supabase = createClient();
            const formData = new FormData();
            formData.append("file", file);
            formData.append("tipo", tipo);
            const { data, error } = await supabase.functions.invoke("importar-dados", {
                body: formData,
            });
            if (error) throw error;
            setStatus("done");
            setMessage(`Importação concluída! ${(data as { familias_afetadas?: number })?.familias_afetadas || 0} famílias afetadas.`);
        } catch (err: unknown) {
            setStatus("error");
            setMessage(err instanceof Error ? err.message : "Erro ao importar arquivo.");
        }
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-10">
            <div>
                <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Importação & Relatórios</h1>
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Central de processamento e inteligência de dados (CadÚnico & e-SUS)
                </p>
            </div>

            {/* Import Form */}
            {canImport && (
                <div className="card p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>

                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Upload size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Importar Novos Dados</h2>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mt-0.5">Sincronização Intersetorial</p>
                        </div>
                    </div>

                    <form onSubmit={handleImport} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Tipo de Fonte de Dados</label>
                                <select className="input h-14 text-base font-medium" value={tipo} onChange={e => setTipo(e.target.value as "CadUnico" | "eSUS")}>
                                    <option value="CadUnico">CadÚnico (Indicadores Sociais)</option>
                                    <option value="eSUS">e-SUS APS (Indicadores de Saúde)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Arquivo para Processamento</label>
                                <div className="relative group">
                                    <input
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-3.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
                                        type="file"
                                        accept=".csv,.txt"
                                        onChange={e => setFile(e.target.files?.[0] || null)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Field reference */}
                        <div className="glass-card !bg-blue-50/50 border-blue-100 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-3 text-blue-900">
                                <AlertCircle size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Estrutura de Campos Esperada</span>
                            </div>
                            <p className="text-[13px] leading-relaxed text-blue-800 font-medium">
                                {tipo === "CadUnico" ? (
                                    "NIS, CPF, RendaPerCapita, TemCrianca0a6, TemIdoso60plus, TemMaeSolo, SemSaneamento, MoradiaPrecariaBarraco, ResponsavelDesempregado, BaixaEscolaridade"
                                ) : (
                                    "CPF, CNS, GestanteFaltosa, GestanteRegular, CriancaDesnutrida, DiabetesDescontrolada, HipertensaoDescontrolada, CancerOuDoencaRenal, DoencaCardiaca, DoencaRespiratoria, SituacaoRua, DependenciaQuimica, AcamadoDomiciliado, InternacaoRecente"
                                )}
                            </p>
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" className="btn-primary h-14 px-10 rounded-2xl text-base font-bold shadow-xl shadow-blue-500/30" disabled={!file || status === "processing"}>
                                {status === "processing" ? (
                                    <><Loader2 size={20} className="animate-spin" /> Processando Inteligência...</>
                                ) : (
                                    <><Upload size={20} /> Iniciar Importação</>
                                )}
                            </button>
                        </div>
                    </form>

                    {status !== "idle" && (
                        <div className={`flex items-start gap-3 p-4 rounded-lg border ${status === "done" ? "bg-green-50 border-green-200 text-green-800" :
                            status === "error" ? "bg-red-50 border-red-200 text-red-800" :
                                "bg-blue-50 border-blue-200 text-blue-800"
                            }`}>
                            {status === "done" ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                                : status === "error" ? <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                    : <Loader2 size={18} className="animate-spin shrink-0 mt-0.5" />}
                            <p className="text-sm">{message}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Export Reports */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                        <FileText size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Central de Relatórios</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                        { label: "Relatório Executivo (Excel)", desc: "KPIs por território, distribuição de risco", ext: "xlsx" },
                        { label: "Lista de Busca Ativa (PDF)", desc: "Famílias críticas com ação recomendada", ext: "pdf" },
                        { label: "Relatório Intersetorial (PDF)", desc: "Gatilhos CRAS + UBS combinados", ext: "pdf" },
                        { label: "Log de Auditoria (CSV)", desc: "Trilha completa de alterações (LGPD)", ext: "csv" },
                    ].filter(r => r.label !== "Log de Auditoria (CSV)" || canSeeAudit).map(r => (
                        <button key={r.label}
                            className="text-left p-6 rounded-2xl bg-white border border-gray-100 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all group relative overflow-hidden active:scale-[0.98]"
                            onClick={() => {
                                const supabase = createClient();
                                supabase.functions.invoke("exportar-relatorio", {
                                    body: { tipo: r.ext, relatorio: r.label }
                                }).then(({ data }) => {
                                    if (data) {
                                        const url = URL.createObjectURL(new Blob([data as BlobPart]));
                                        const a = document.createElement("a"); a.href = url;
                                        a.download = `relatorio.${r.ext}`; a.click();
                                    }
                                });
                            }}>
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 group-hover:text-blue-600 transition-opacity">
                                <Download size={24} />
                            </div>
                            <p className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{r.label}</p>
                            <p className="text-sm text-gray-500 mt-1 font-medium">{r.desc}</p>
                            <div className="mt-4 flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-black uppercase text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">{r.ext}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
