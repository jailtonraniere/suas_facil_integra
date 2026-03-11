import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RiscLevel } from "./supabase/types";

// ─── Normalização de Perfis ──────────────────────────────────────────────────
// Mapeia perfis legados (banco antigo) para os perfis canônicos do sistema.
// Isso garante compatibilidade sem precisar atualizar o banco.
const PROFILE_ALIAS_MAP: Record<string, string> = {
    // Legados → Canônicos
    "Admin":        "SECRETARIO_MUNICIPAL",
    "Gestor":       "GESTOR_OPERACIONAL",
    "Coordenador":  "COORDENADOR_UNIDADE",
    "Tecnico":      "TECNICO_REFERENCIA",
    "Tecnico_CRAS": "TECNICO_REFERENCIA",
    "Tecnico_UBS":  "TECNICO_REFERENCIA",
};

/** Converte qualquer variação de perfil para o nome canônico do sistema. */
export function normalizeProfile(perfil?: string | null): string {
    if (!perfil) return "";
    return PROFILE_ALIAS_MAP[perfil] ?? perfil;
}

/** Labels amigáveis em PT-BR para cada perfil canônico. */
export const PROFILE_LABELS: Record<string, string> = {
    SECRETARIO_MUNICIPAL:  "Secretário Municipal",
    GESTOR_OPERACIONAL:    "Gestor Operacional",
    COORDENADOR_UNIDADE:   "Coordenador de Unidade",
    TECNICO_REFERENCIA:    "Técnico de Referência",
    AUDITOR_LGPD:          "Auditor LGPD",
    ADMIN_SISTEMA:         "Administrador do Sistema",
};

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getRiscBadgeClass(level?: RiscLevel | string): string {
    switch (level) {
        case "CRÍTICA": return "badge-critica";
        case "ALTA": return "badge-alta";
        case "MODERADA": return "badge-moderada";
        default: return "badge-baixa";
    }
}

export function getRiscColor(level?: RiscLevel | string): string {
    switch (level) {
        case "CRÍTICA": return "#DC2626";
        case "ALTA": return "#F97316";
        case "MODERADA": return "#FACC15";
        default: return "#22C55E";
    }
}

export function scoreBar(value: number, max: number = 10): number {
    return Math.min((value / max) * 100, 100);
}

export function formatDate(iso?: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("pt-BR");
}

export function formatDateTime(iso?: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("pt-BR");
}
