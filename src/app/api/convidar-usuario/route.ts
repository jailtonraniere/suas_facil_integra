import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * POST /api/convidar-usuario
 * Envia um e-mail de convite para o usuário recém-cadastrado via Supabase Auth.
 * O usuário recebe um link para definir sua senha e acessar o sistema.
 *
 * Body: { email: string; nome: string; perfil: string }
 */
export async function POST(req: NextRequest) {
    try {
        const { email, nome, perfil } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "E-mail é obrigatório." }, { status: 400 });
        }

        const adminClient = createAdminClient();

        // Convida o usuário via Supabase Auth.
        // O Supabase envia automaticamente um e-mail com link "magic link" para
        // o usuário definir sua senha no primeiro acesso.
        const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://suas-facil-integra.vercel.app"}/login`,
            data: {
                nome,
                perfil,
            },
        });

        if (error) {
            // Se o usuário já existe no Auth, o convite ainda pode funcionar em alguns casos.
            // Retornamos o erro mas não quebramos o fluxo.
            console.error("[convidar-usuario] Erro ao convidar:", error.message);
            return NextResponse.json(
                { error: `Não foi possível enviar o convite: ${error.message}` },
                { status: 400 }
            );
        }

        return NextResponse.json({
            sucesso: true,
            userId: data.user?.id,
            message: `Convite enviado para ${email}`,
        });
    } catch (e: any) {
        console.error("[convidar-usuario] Erro interno:", e.message);
        return NextResponse.json({ error: `Erro interno: ${e.message}` }, { status: 500 });
    }
}
