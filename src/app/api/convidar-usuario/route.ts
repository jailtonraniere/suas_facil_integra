import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * POST /api/convidar-usuario
 *
 * Fluxo correto:
 * 1. Convida o usuário via Supabase Auth → obtém o auth UUID real
 * 2. Insere (ou atualiza) o registro na tabela `usuarios` com esse UUID
 *
 * Isso garante que auth.uid() == usuarios.id para que o Sidebar
 * consiga carregar o perfil corretamente.
 *
 * Body: { email, nome, perfil, ativo, municipio_id }
 */
export async function POST(req: NextRequest) {
    try {
        const { email, nome, perfil, ativo = true, municipio_id } = await req.json();

        if (!email || !nome || !perfil) {
            return NextResponse.json(
                { error: "Campos obrigatórios: email, nome, perfil." },
                { status: 400 }
            );
        }

        const admin = createAdminClient();

        // ── 1. Convida via Supabase Auth ────────────────────────────────
        const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
            email,
            {
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://suas-facil-integra.vercel.app"}/login`,
                data: { nome, perfil },
            }
        );

        if (inviteError) {
            console.error("[convidar-usuario] Erro ao convidar:", inviteError.message);
            return NextResponse.json(
                { error: `Não foi possível enviar o convite: ${inviteError.message}` },
                { status: 400 }
            );
        }

        const authUserId = inviteData.user?.id;
        if (!authUserId) {
            return NextResponse.json(
                { error: "Convite enviado, mas não foi possível obter o ID do usuário." },
                { status: 500 }
            );
        }

        // ── 2. Insere / atualiza na tabela usuarios com o UUID correto ──
        const { error: dbError } = await admin
            .from("usuarios")
            .upsert(
                {
                    id: authUserId,   // ← UUID do Supabase Auth (garante sync)
                    email,
                    nome,
                    perfil,
                    ativo,
                    municipio_id: municipio_id ?? null,
                },
                { onConflict: "id" }
            );

        if (dbError) {
            console.error("[convidar-usuario] Erro ao inserir em usuarios:", dbError.message);
            // Usuário já está no Auth mas não no DB — retorna aviso
            return NextResponse.json({
                sucesso: true,
                aviso: `Convite enviado, mas houve erro ao salvar no banco: ${dbError.message}`,
                userId: authUserId,
            });
        }

        return NextResponse.json({
            sucesso: true,
            userId: authUserId,
            message: `Convite enviado para ${email}`,
        });
    } catch (e: any) {
        console.error("[convidar-usuario] Erro interno:", e.message);
        return NextResponse.json({ error: `Erro interno: ${e.message}` }, { status: 500 });
    }
}
