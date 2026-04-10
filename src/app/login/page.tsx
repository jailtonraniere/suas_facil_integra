"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, Eye, Facebook, Instagram, Linkedin, Globe } from "lucide-react";

export default function LoginPage() {
    const supabase = createClient();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) { setError(authError.message); setLoading(false); return; }
        router.push("/dashboard");
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-[480px] space-y-8 flex flex-col items-center">

                {/* Logo Section */}
                <div className="flex flex-col items-center text-center space-y-4 w-full">
                    <img
                        src="/logo_full.png"
                        alt="SUAS Fácil Integra"
                        className="h-20 sm:h-32 object-contain"
                    />
                    <div className="w-full h-px bg-gray-100 mt-2"></div>
                </div>

                <div className="w-full space-y-6">
                    <p className="text-gray-600 text-[15px] font-medium px-1">Digite seu e-mail e senha para logar</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative">
                            <input
                                className="input h-[58px] bg-white border-gray-200 text-gray-700 pl-6 pr-12 focus:border-blue-300"
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="E-mail"
                            />
                            <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        </div>

                        <div className="relative">
                            <input
                                className="input h-[58px] bg-white border-gray-200 text-gray-700 pl-6 pr-16 focus:border-blue-300"
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Senha"
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3 text-gray-400">
                                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                                    <Eye size={20} />
                                </button>
                                <Lock size={20} className="text-gray-400" />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
                            <button type="button" className="text-blue-900 font-semibold text-[15px] hover:underline">
                                Esqueceu sua senha?
                            </button>
                            <button
                                type="submit"
                                className="btn-primary px-10 py-3 uppercase tracking-wider text-[13px] font-bold h-[48px]"
                                disabled={loading}
                            >
                                {loading ? "Aguarde..." : "Entrar"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer Section */}
                <div className="pt-12 text-center space-y-6 w-full">
                    <p className="text-gray-500 text-[14px] leading-relaxed">
                        Quer conhecer outros produtos para a assistência social do seu município?
                    </p>

                    {/* Social Media Row */}
                    <div className="flex items-center justify-center gap-3">
                        <a href="https://www.facebook.com/suasfacil" target="_blank" rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-[#3B5998] flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                            <Facebook size={18} fill="currentColor" />
                        </a>
                        <a href="https://www.instagram.com/suasfacil/" target="_blank" rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 to-purple-500 flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                            <Instagram size={18} />
                        </a>
                        <a href="https://www.linkedin.com/company/suasfacil/" target="_blank" rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-[#0077B5] flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                            <Linkedin size={18} fill="currentColor" />
                        </a>
                        <a href="https://suasfacil.com.br/" target="_blank" rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-[#2EAA55] flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                            <Globe size={18} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
