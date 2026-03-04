"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Users, MapPin, Building, Plus, Pencil, X, Save, AlertCircle } from "lucide-react";
import type { Usuario, Territorio, Municipio } from "@/lib/supabase/types";

export default function ConfiguracoesPage() {
    const supabase = createClient();
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [territorios, setTerritorios] = useState<Territorio[]>([]);
    const [municipio, setMunicipio] = useState<Municipio | null>(null);

    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isTerritoryModalOpen, setIsTerritoryModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [editingTerritory, setEditingTerritory] = useState<any>(null);

    const [formDataUser, setFormDataUser] = useState({ nome: "", email: "", perfil: "Tecnico_CRAS", ativo: true });
    const [formDataTerritory, setFormDataTerritory] = useState({ nome: "", tipo: "CRAS", ativo: true });

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
        console.log("Saving user:", formDataUser, "Editing:", editingUser?.id);
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
            console.error("Error saving user:", err);
            alert("Erro ao salvar usuário: " + err.message);
        }
    };

    const handleSaveTerritory = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Saving territory:", formDataTerritory, "Editing:", editingTerritory?.id);
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
            console.error("Error saving territory:", err);
            alert("Erro ao salvar território: " + err.message);
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
                    <button
                        onClick={() => handleOpenUserModal()}
                        className="btn-primary py-2 px-4 text-xs flex items-center gap-2"
                    >
                        <Plus size={14} /> Adicionar Usuário
                    </button>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>{["Nome", "E-mail", "Perfil", "Status"].map(h => (
                            <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                        ))}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {usuarios.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50 group">
                                <td className="px-4 py-3 font-medium text-gray-900">{u.nome}</td>
                                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">{u.perfil}</span>
                                        <button
                                            onClick={() => handleOpenUserModal(u)}
                                            className="p-1 text-gray-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all"
                                            title="Editar"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs ${u.ativo ? "text-green-600" : "text-red-500"}`}>
                                        {u.ativo ? "Ativo" : "Inativo"}
                                    </span>
                                </td>
                            </tr>
                        ))}
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
                    <button
                        onClick={() => handleOpenTerritoryModal()}
                        className="btn-primary py-2 px-4 text-xs flex items-center gap-2"
                    >
                        <Plus size={14} /> Novo Território
                    </button>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>{["Nome", "Tipo", "Status"].map(h => (
                            <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                        ))}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {territorios.map(t => (
                            <tr key={t.id} className="hover:bg-gray-50 group">
                                <td className="px-4 py-3 font-medium text-gray-900">{t.nome}</td>
                                <td className="px-4 py-3 text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <span>{t.tipo}</span>
                                        <button
                                            onClick={() => handleOpenTerritoryModal(t)}
                                            className="p-1 text-gray-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all"
                                            title="Editar"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs ${t.ativo ? "text-green-600" : "text-red-500"}`}>
                                        {t.ativo ? "Ativo" : "Inativo"}
                                    </span>
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
                                    className="input focus:border-blue-400"
                                    required
                                    value={formDataUser.nome}
                                    onChange={e => setFormDataUser({ ...formDataUser, nome: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">E-mail</label>
                                <input
                                    className="input focus:border-blue-400"
                                    required type="email"
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
                                        <option value="Gestor">Gestor</option>
                                        <option value="Coordenador">Coordenador</option>
                                        <option value="Tecnico_CRAS">Técnico CRAS</option>
                                        <option value="Tecnico_UBS">Técnico UBS</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                                    <div className="flex items-center gap-3 h-[45px]">
                                        <input
                                            type="checkbox"
                                            id="user_active"
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
                                    className="input focus:border-blue-400"
                                    required
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
                                            type="checkbox"
                                            id="territory_active"
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
        </div>
    );
}
