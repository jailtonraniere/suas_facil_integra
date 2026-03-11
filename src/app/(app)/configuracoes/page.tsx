"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { normalizeProfile, PROFILE_LABELS } from "@/lib/utils";
import { Users, MapPin, Building, Plus, Pencil, Trash2, X, Save, AlertCircle, Upload, FileUp, CheckCircle, AlertTriangle } from "lucide-react";
import type { Usuario, Territorio, Municipio } from "@/lib/supabase/types";

export default function ConfiguracoesPage() {
    const supabase = createClient();
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [territorios, setTerritorios] = useState<Territorio[]>([]);
    const [municipio, setMunicipio] = useState<Municipio | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isTerritoryModalOpen, setIsTerritoryModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [editingTerritory, setEditingTerritory] = useState<any>(null);

    // Delete confirmation state
    const [deleteTarget, setDeleteTarget] = useState<{
        type: "usuario" | "territorio";
        id: string;
        nome: string;
    } | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const [formDataUser, setFormDataUser] = useState({ nome: "", email: "", perfil: "Tecnico_CRAS", ativo: true });
    const [formDataTerritory, setFormDataTerritory] = useState({ nome: "", tipo: "CRAS", ativo: true });

    // Import state
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importTipo, setImportTipo] = useState("cadunico");
    const [importTerritorioId, setImportTerritorioId] = useState("");
    const [importLoading, setImportLoading] = useState(false);
    const [importResult, setImportResult] = useState<{ sucesso?: boolean; inseridos?: number; ignorados?: number; erros?: string[]; error?: string } | null>(null);
    const [dragOver, setDragOver] = useState(false);

    async function refreshData() {
        const [{ data: u }, { data: t }, { data: m }] = await Promise.all([
            supabase.from("usuarios").select("id, nome, email, perfil, ativo").order("nome"),
            supabase.from("territorios").select("id, nome, tipo, ativo").order("nome"),
            supabase.from("municipios").select("id, nome, estado, email").limit(1).maybeSingle(),
        ]);
        if (u) setUsuarios(u);
        if (t) setTerritorios(t);
        if (m) setMunicipio(m);
    }

    useEffect(() => {
        refreshData();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setCurrentUserId(user.id);
        });
    }, []);

    const handleOpenUserModal = (user: any = null) => {
        if (user) {
            setEditingUser(user);
            setFormDataUser({ nome: user.nome, email: user.email, perfil: user.perfil, ativo: user.ativo });
        } else {
            setEditingUser(null);
            setFormDataUser({ nome: "", email: "", perfil: "Tecnico_CRAS", ativo: true });
        }
        setIsUserModalOpen(true);
    };

    const handleOpenTerritoryModal = (territory: any = null) => {
        if (territory) {
            setEditingTerritory(territory);
            setFormDataTerritory({ nome: territory.nome, tipo: territory.tipo, ativo: territory.ativo });
        } else {
            setEditingTerritory(null);
            setFormDataTerritory({ nome: "", tipo: "CRAS", ativo: true });
        }
        setIsTerritoryModalOpen(true);
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const client = supabase as any;
            if (editingUser) {
                const { error } = await client.from("usuarios").update(formDataUser).eq("id", editingUser.id);
                if (error) throw error;
            } else {
                const { error } = await client.from("usuarios").insert([{ ...formDataUser, municipio_id: municipio?.id }]);
                if (error) throw error;
            }
            setIsUserModalOpen(false);
            refreshData();
        } catch (err: any) {
            alert("Erro ao salvar usuário: " + err.message);
        }
    };

    const handleSaveTerritory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const client = supabase as any;
            if (editingTerritory) {
                const { error } = await client.from("territorios").update(formDataTerritory).eq("id", editingTerritory.id);
                if (error) throw error;
            } else {
                const { error } = await client.from("territorios").insert([{ ...formDataTerritory, municipio_id: municipio?.id }]);
                if (error) throw error;
            }
            setIsTerritoryModalOpen(false);
            refreshData();
        } catch (err: any) {
            alert("Erro ao salvar território: " + err.message);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        setDeleteError(null);
        try {
            const client = supabase as any;
            if (deleteTarget.type === "usuario") {
                const { error } = await client.from("usuarios").delete().eq("id", deleteTarget.id);
                if (error) throw error;
            } else {
                const { error } = await client.from("territorios").delete().eq("id", deleteTarget.id);
                if (error) throw error;
            }
            setDeleteTarget(null);
            refreshData();
        } catch (err: any) {
            setDeleteError(err.message || "Erro ao excluir. Verifique se há registros vinculados.");
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Configurações</h1>
                    <p className="text-sm text-gray-500 mt-1">Gerenciamento de sistema, usuários e territórios</p>
                </div>
            </div>

            {/* Município */}
            {municipio && (
                <div className="card p-6 border-blue-100 bg-blue-50/30 flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600">
                        <Building size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-blue-900">{municipio.nome} — {municipio.estado}</h2>
                        <p className="text-sm text-blue-600/70 font-medium">{municipio.email}</p>
                    </div>
                </div>
            )}

            {/* Usuários */}
            <div className="card overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Users size={20} />
                        </div>
                        <h2 className="font-bold text-gray-900">Usuários e Perfis</h2>
                    </div>
                    <button onClick={() => handleOpenUserModal()} className="btn-primary py-2 px-4 text-xs flex items-center gap-2">
                        <Plus size={14} /> Adicionar Usuário
                    </button>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>{["Nome", "E-mail", "Perfil", "Status", "Ações"].map(h => (
                            <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                        ))}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {usuarios.map(u => {
                            const isSelf = u.id === currentUserId;
                            const perfilLabel = PROFILE_LABELS[normalizeProfile(u.perfil)] ?? u.perfil;
                            return (
                                <tr key={u.id} className="hover:bg-gray-50 group">
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        <div className="flex items-center gap-2">
                                            {u.nome}
                                            {isSelf && (
                                                <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">você</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">{perfilLabel}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-medium ${u.ativo ? "text-green-600" : "text-red-500"}`}>
                                            {u.ativo ? "Ativo" : "Inativo"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => handleOpenUserModal(u)}
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                title="Editar"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => !isSelf && setDeleteTarget({ type: "usuario", id: u.id, nome: u.nome })}
                                                disabled={isSelf}
                                                className={`p-1.5 rounded-lg transition-colors ${isSelf ? "text-gray-200 cursor-not-allowed" : "text-gray-400 hover:text-red-600 hover:bg-red-50"}`}
                                                title={isSelf ? "Não é possível excluir o seu próprio usuário" : "Excluir"}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Territórios */}
            <div className="card overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <MapPin size={20} />
                        </div>
                        <h2 className="font-bold text-gray-900">Territórios Cadastrados</h2>
                    </div>
                    <button onClick={() => handleOpenTerritoryModal()} className="btn-primary py-2 px-4 text-xs flex items-center gap-2">
                        <Plus size={14} /> Novo Território
                    </button>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>{["Nome", "Tipo", "Status", "Ações"].map(h => (
                            <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                        ))}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {territorios.map(t => (
                            <tr key={t.id} className="hover:bg-gray-50 group">
                                <td className="px-4 py-3 font-medium text-gray-900">{t.nome}</td>
                                <td className="px-4 py-3 text-gray-600">{t.tipo}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs font-medium ${t.ativo ? "text-green-600" : "text-red-500"}`}>
                                        {t.ativo ? "Ativo" : "Inativo"}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        <button
                                            onClick={() => handleOpenTerritoryModal(t)}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                            title="Editar"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget({ type: "territorio", id: t.id, nome: t.nome })}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* User Modal */}
            {isUserModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-blue-900">{editingUser ? "Editar Usuário" : "Adicionar Usuário"}</h3>
                            <button onClick={() => setIsUserModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Nome Completo</label>
                                <input
                                    className="input focus:border-blue-400" required
                                    value={formDataUser.nome}
                                    onChange={e => setFormDataUser({ ...formDataUser, nome: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">E-mail</label>
                                <input
                                    className="input focus:border-blue-400" required type="email"
                                    value={formDataUser.email}
                                    onChange={e => setFormDataUser({ ...formDataUser, email: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Perfil</label>
                                    <select
                                        className="input focus:border-blue-400"
                                        value={formDataUser.perfil}
                                        onChange={e => setFormDataUser({ ...formDataUser, perfil: e.target.value })}
                                    >
                                        <option value="Admin">Secretário Municipal</option>
                                        <option value="Gestor">Gestor Operacional</option>
                                        <option value="Coordenador">Coordenador de Unidade</option>
                                        <option value="Tecnico_CRAS">Técnico de Referência (CRAS)</option>
                                        <option value="Tecnico_UBS">Técnico de Referência (UBS)</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                                    <div className="flex items-center gap-3 h-[45px]">
                                        <input
                                            type="checkbox" id="user_active"
                                            className="w-5 h-5 accent-blue-600"
                                            checked={formDataUser.ativo}
                                            onChange={e => setFormDataUser({ ...formDataUser, ativo: e.target.checked })}
                                        />
                                        <label htmlFor="user_active" className="text-sm font-medium text-gray-700">Ativo</label>
                                    </div>
                                </div>
                            </div>
                            {!editingUser && (
                                <div className="bg-amber-50 p-4 rounded-xl flex gap-3 text-amber-800 text-sm">
                                    <AlertCircle size={20} className="shrink-0" />
                                    <p>O usuário será convidado via e-mail para definir sua senha no primeiro acesso.</p>
                                </div>
                            )}
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-5 py-2.5 text-gray-600 font-semibold text-sm">Cancelar</button>
                                <button type="submit" className="btn-primary px-8 flex items-center gap-2"><Save size={18} /> Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Territory Modal */}
            {isTerritoryModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-blue-900">{editingTerritory ? "Editar Território" : "Novo Território"}</h3>
                            <button onClick={() => setIsTerritoryModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSaveTerritory} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Nome do Equipamento/Bairro</label>
                                <input
                                    className="input focus:border-blue-400" required
                                    value={formDataTerritory.nome}
                                    onChange={e => setFormDataTerritory({ ...formDataTerritory, nome: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Tipo</label>
                                    <select
                                        className="input focus:border-blue-400"
                                        value={formDataTerritory.tipo}
                                        onChange={e => setFormDataTerritory({ ...formDataTerritory, tipo: e.target.value })}
                                    >
                                        <option value="CRAS">CRAS</option>
                                        <option value="UBS">UBS</option>
                                        <option value="Bairro">Bairro</option>
                                        <option value="Microarea">Microárea</option>
                                        <option value="Outro">Outro</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                                    <div className="flex items-center gap-3 h-[45px]">
                                        <input
                                            type="checkbox" id="territory_active"
                                            className="w-5 h-5 accent-blue-600"
                                            checked={formDataTerritory.ativo}
                                            onChange={e => setFormDataTerritory({ ...formDataTerritory, ativo: e.target.checked })}
                                        />
                                        <label htmlFor="territory_active" className="text-sm font-medium text-gray-700">Ativo</label>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsTerritoryModalOpen(false)} className="px-5 py-2.5 text-gray-600 font-semibold text-sm">Cancelar</button>
                                <button type="submit" className="btn-primary px-8 flex items-center gap-2"><Save size={18} /> Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── Delete Confirmation Modal ─────────────────────────────────────── */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                                    <AlertTriangle size={20} className="text-red-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Confirmar Exclusão</h3>
                            </div>
                            <button onClick={() => { setDeleteTarget(null); setDeleteError(null); }} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Você está prestes a excluir{" "}
                                {deleteTarget.type === "usuario" ? "o usuário" : "o território"}{" "}
                                <span className="font-bold text-gray-900">"{deleteTarget.nome}"</span>.
                            </p>
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                                <p className="font-semibold mb-1">⚠️ Esta ação é irreversível.</p>
                                {deleteTarget.type === "usuario" ? (
                                    <p>O usuário perderá o acesso imediatamente. Os registros históricos vinculados a ele serão mantidos.</p>
                                ) : (
                                    <p>A exclusão falhará se houver famílias ou usuários vinculados a este território. Remova os vínculos antes de continuar.</p>
                                )}
                            </div>
                            {deleteError && (
                                <div className="bg-red-50 border border-red-300 rounded-xl p-3 flex items-start gap-2 text-red-700 text-sm">
                                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                    <p>{deleteError}</p>
                                </div>
                            )}
                        </div>
                        <div className="px-6 pb-6 flex justify-end gap-3">
                            <button
                                onClick={() => { setDeleteTarget(null); setDeleteError(null); }}
                                className="px-5 py-2.5 text-gray-600 font-semibold text-sm rounded-xl hover:bg-gray-100 transition-colors"
                                disabled={deleteLoading}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={deleteLoading}
                                className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors"
                            >
                                {deleteLoading ? (
                                    <><span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" /> Excluindo...</>
                                ) : (
                                    <><Trash2 size={16} /> Excluir</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* === IMPORT SECTION === */}
            <div className="card">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-xl">
                            <Upload size={20} className="text-green-600" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900">Importar Dados</h2>
                            <p className="text-xs text-gray-500">CadÚnico ou e-SUS APS (CSV)</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-5">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Dados</label>
                            <select className="input w-full" value={importTipo} onChange={e => setImportTipo(e.target.value)}>
                                <option value="cadunico">CadÚnico</option>
                                <option value="esus">e-SUS APS</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Território de Destino</label>
                            <select className="input w-full" value={importTerritorioId} onChange={e => setImportTerritorioId(e.target.value)}>
                                <option value="">Selecione o território...</option>
                                {territorios.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                            </select>
                        </div>
                    </div>

                    <div
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50"}`}
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={e => {
                            e.preventDefault(); setDragOver(false);
                            const f = e.dataTransfer.files[0];
                            if (f) { setImportFile(f); setImportResult(null); }
                        }}
                        onClick={() => document.getElementById("import-file-input")?.click()}
                    >
                        <FileUp size={36} className={`mx-auto mb-3 ${dragOver ? "text-blue-500" : "text-gray-400"}`} />
                        {importFile ? (
                            <p className="text-sm font-medium text-blue-700">{importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)</p>
                        ) : (
                            <>
                                <p className="text-sm font-medium text-gray-600">Arraste um arquivo CSV aqui</p>
                                <p className="text-xs text-gray-400 mt-1">ou clique para selecionar</p>
                            </>
                        )}
                        <input
                            id="import-file-input" type="file" className="hidden" accept=".csv,.xlsx"
                            onChange={e => { const f = e.target.files?.[0]; if (f) { setImportFile(f); setImportResult(null); } }}
                        />
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                        <p className="font-semibold mb-1">Colunas esperadas no CSV (CadÚnico):</p>
                        <p className="font-mono">nome_responsavel, nis_responsavel, endereco, renda_per_capita, situacao_rua, moradia_precaria, tem_crianca, tem_idoso, mae_solo, deficiente, desempregado</p>
                        <p className="mt-2 font-semibold">Use 1 para Sim e 0 para Não nos campos booleanos. Separador: vírgula ou ponto-e-vírgula.</p>
                    </div>

                    <button
                        disabled={!importFile || !importTerritorioId || importLoading}
                        className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={async () => {
                            if (!importFile || !importTerritorioId || !municipio?.id) return;
                            setImportLoading(true); setImportResult(null);
                            const fd = new FormData();
                            fd.append("file", importFile);
                            fd.append("tipo", importTipo);
                            fd.append("territorio_id", importTerritorioId);
                            fd.append("municipio_id", municipio.id);
                            try {
                                const res = await fetch("/api/importar", { method: "POST", body: fd });
                                const json = await res.json();
                                setImportResult(json);
                                if (json.sucesso) setImportFile(null);
                            } catch (e: any) {
                                setImportResult({ error: e.message });
                            } finally { setImportLoading(false); }
                        }}
                    >
                        {importLoading ? <><span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" /> Importando...</> : <><Upload size={16} /> Importar Arquivo</>}
                    </button>

                    {importResult && (
                        <div className={`p-4 rounded-xl border text-sm ${importResult.sucesso ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                            {importResult.sucesso ? (
                                <div className="flex items-start gap-2">
                                    <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold">Importação concluída!</p>
                                        <p>{importResult.inseridos} famílias importadas · {importResult.ignorados} ignoradas de {importResult.inseridos! + importResult.ignorados!} registros.</p>
                                        {importResult.erros && importResult.erros.length > 0 && (
                                            <div className="mt-2">
                                                <p className="font-semibold text-amber-700">Avisos ({importResult.erros.length}):</p>
                                                <ul className="list-disc list-inside text-xs mt-1 space-y-0.5 text-amber-700">
                                                    {importResult.erros.map((e, i) => <li key={i}>{e}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-2">
                                    <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                                    <p><span className="font-semibold">Erro:</span> {importResult.error}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
