"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Users, MapPin, Building } from "lucide-react";

export default function ConfiguracoesPage() {
    const supabase = createClient();
    const [usuarios, setUsuarios] = useState<{ id: string; nome: string; email: string; perfil: string; ativo: boolean }[]>([]);
    const [territorios, setTerritorios] = useState<{ id: string; nome: string; tipo: string; ativo: boolean }[]>([]);
    const [municipio, setMunicipio] = useState<{ nome: string; estado: string; email: string } | null>(null);

    useEffect(() => {
        Promise.all([
            supabase.from("usuarios").select("id, nome, email, perfil, ativo").order("nome"),
            supabase.from("territorios").select("id, nome, tipo, ativo").order("nome"),
            supabase.from("municipios").select("nome, estado, email").limit(1).maybeSingle(),
        ]).then(([{ data: u }, { data: t }, { data: m }]) => {
            if (u) setUsuarios(u);
            if (t) setTerritorios(t);
            if (m) setMunicipio(m);
        });
    }, []);

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
                    <button className="btn-primary py-2 px-4 text-xs">Adicionar Usuário</button>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>{["Nome", "E-mail", "Perfil", "Status"].map(h => (
                            <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                        ))}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {usuarios.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">{u.nome}</td>
                                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                                <td className="px-4 py-3">
                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">{u.perfil}</span>
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
                    <button className="btn-primary py-2 px-4 text-xs">Novo Território</button>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>{["Nome", "Tipo", "Status"].map(h => (
                            <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                        ))}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {territorios.map(t => (
                            <tr key={t.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">{t.nome}</td>
                                <td className="px-4 py-3 text-gray-600">{t.tipo}</td>
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
        </div>
    );
}
