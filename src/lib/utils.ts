import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RiscLevel } from "./supabase/types";

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
