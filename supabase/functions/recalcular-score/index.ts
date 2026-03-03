import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const body = await req.json().catch(() => ({}));
        const familia_id: string | undefined = body?.familia_id;
        const motivo: string = body?.motivo ?? "api";

        if (familia_id) {
            // Recálculo incremental para uma família específica
            const { error } = await supabase.rpc("recalcular_score_familiar", {
                p_familia_id: familia_id,
                p_motivo: motivo,
            });
            if (error) throw error;
            return new Response(JSON.stringify({ ok: true, family: familia_id }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Recálculo BATCH: todas as famílias ativas
        const { data: familias, error: fErr } = await supabase
            .from("familias")
            .select("id")
            .eq("ativo", true);
        if (fErr) throw fErr;

        let processadas = 0;
        let erros = 0;
        for (const f of (familias ?? [])) {
            const { error } = await supabase.rpc("recalcular_score_familiar", {
                p_familia_id: f.id,
                p_motivo: "batch",
            });
            if (error) erros++;
            else processadas++;
        }

        return new Response(JSON.stringify({ ok: true, processadas, erros }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: String(err) }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
