import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CadUnicoRow {
    NIS?: string; CPF?: string; Nome?: string; RendaPerCapita?: string;
    SituacaoRua?: string; MoradiaPrecaria?: string; SemSaneamento?: string;
    TemCrianca0a6?: string; TemIdoso60plus?: string; TemMaeSolo?: string;
    TemDeficiente?: string; ResponsavelDesempregado?: string; BaixaEscolaridade?: string;
}

function parseBool(v?: string): boolean { return v?.toLowerCase() === "sim" || v === "1" || v?.toLowerCase() === "true"; }

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const tipo = (formData.get("tipo") as string) || "CadUnico";

        if (!file) throw new Error("Arquivo não enviado.");

        const csv = await file.text();
        const lines = csv.trim().split("\n");
        const headers = lines[0].replace(/[\r]/g, "").split(";");

        // Registrar importação
        const { data: imp, error: impErr } = await supabase
            .from("importacoes")
            .insert({ tipo, arquivo_nome: file.name, total_linhas: lines.length - 1, status: "Processando" })
            .select("id").single();
        if (impErr) throw impErr;
        const importacaoId = imp.id;

        let familiasAfetadas = 0;
        const erros: string[] = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].replace(/[\r]/g, "").split(";");
            const row: Record<string, string> = {};
            headers.forEach((h, idx) => { row[h.trim()] = (values[idx] || "").trim(); });

            try {
                if (tipo === "CadUnico") {
                    const r = row as CadUnicoRow;
                    // Buscar ou criar família por NIS/CPF
                    const nis = r.NIS?.replace(/\D/g, "");
                    const cpf = r.CPF?.replace(/\D/g, "");

                    let familia_id: string | null = null;
                    if (nis) {
                        const { data } = await supabase.from("familias").select("id").eq("nis_responsavel", nis).maybeSingle();
                        familia_id = data?.id ?? null;
                    }
                    if (!familia_id && cpf) {
                        const { data } = await supabase.from("familias").select("id").eq("cpf_responsavel", cpf).maybeSingle();
                        familia_id = data?.id ?? null;
                    }
                    if (!familia_id) continue; // Pular se família não encontrada

                    // Upsert indicadores_sociais
                    await supabase.from("indicadores_sociais").upsert({
                        familia_id,
                        renda_per_capita: r.RendaPerCapita ? parseFloat(r.RendaPerCapita.replace(",", ".")) : null,
                        situacao_rua: parseBool(r.SituacaoRua),
                        moradia_precaria: parseBool(r.MoradiaPrecaria),
                        sem_saneamento: parseBool(r.SemSaneamento),
                        tem_crianca_0a6: parseBool(r.TemCrianca0a6),
                        tem_idoso_60plus: parseBool(r.TemIdoso60plus),
                        tem_mae_solo: parseBool(r.TemMaeSolo),
                        tem_deficiente: parseBool(r.TemDeficiente),
                        responsavel_desempregado: parseBool(r.ResponsavelDesempregado),
                        baixa_escolaridade: parseBool(r.BaixaEscolaridade),
                    }, { onConflict: "familia_id" });

                    familiasAfetadas++;
                }
                // TODO: adicionar branch para eSUS
            } catch (lineErr) {
                erros.push(`Linha ${i + 1}: ${String(lineErr)}`);
            }
        }

        // Atualizar importação como concluída
        await supabase.from("importacoes").update({
            status: erros.length > 0 ? "Erro" : "Concluído",
            familias_afetadas: familiasAfetadas,
            erros: erros.length > 0 ? erros : null,
            concluido_em: new Date().toISOString(),
        }).eq("id", importacaoId);

        return new Response(JSON.stringify({ ok: true, familias_afetadas: familiasAfetadas, importacao_id: importacaoId, erros }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
