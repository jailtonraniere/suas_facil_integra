import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";

interface CadUnicoRow {
    nis_responsavel?: string;
    nome_responsavel?: string;
    territorio?: string;
    endereco?: string;
    renda_per_capita?: string;
    situacao_rua?: string;
    moradia_precaria?: string;
    tem_crianca?: string;
    tem_idoso?: string;
    mae_solo?: string;
    deficiente?: string;
    desempregado?: string;
    [key: string]: string | undefined;
}

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const tipo = formData.get("tipo") as string | null;
        const territorioId = formData.get("territorio_id") as string | null;
        const municipioId = formData.get("municipio_id") as string | null;

        if (!file) {
            return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
        }

        if (!territorioId || !municipioId) {
            return NextResponse.json({ error: "Território e município são obrigatórios." }, { status: 400 });
        }

        const text = await file.text();
        const ext = file.name.split(".").pop()?.toLowerCase();

        let rows: CadUnicoRow[] = [];

        if (ext === "csv") {
            const result = Papa.parse<CadUnicoRow>(text, {
                header: true,
                skipEmptyLines: true,
                delimiter: "",  // auto-detect
                transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
            });
            if (result.errors.length > 0 && result.data.length === 0) {
                return NextResponse.json({ error: "Erro ao ler o CSV: " + result.errors[0]?.message }, { status: 400 });
            }
            rows = result.data;
        } else {
            return NextResponse.json({ error: "Formato não suportado. Use arquivos CSV." }, { status: 400 });
        }

        if (rows.length === 0) {
            return NextResponse.json({ error: "O arquivo está vazio ou sem dados reconhecíveis." }, { status: 400 });
        }

        // Validate required columns
        const firstRow = rows[0];
        if (!firstRow.nome_responsavel && !firstRow.nome) {
            return NextResponse.json({
                error: "Coluna obrigatória não encontrada: 'nome_responsavel'. Verifique o cabeçalho do arquivo.",
                colunas_encontradas: Object.keys(firstRow),
            }, { status: 400 });
        }

        let inseridos = 0;
        let ignorados = 0;
        const erros: string[] = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const nome = row.nome_responsavel || row.nome || "";

            if (!nome.trim()) {
                ignorados++;
                continue;
            }

            try {
                // Insert familia
                const { data: familia, error: famErr } = await supabaseAdmin
                    .from("familias")
                    .insert({
                        territorio_id: territorioId,
                        nis_responsavel: row.nis_responsavel || row.nis || null,
                        cpf_responsavel: row.cpf_responsavel || row.cpf || null,
                        nome_responsavel: nome.trim(),
                        endereco: row.endereco || null,
                        ativo: true,
                    })
                    .select("id")
                    .single();

                if (famErr || !familia) {
                    erros.push(`Linha ${i + 2}: ${famErr?.message || "Erro desconhecido"}`);
                    ignorados++;
                    continue;
                }

                const familiaId = familia.id;

                // Parse boolean helpers
                const toBool = (v?: string) => v ? ["1", "sim", "s", "true", "yes", "x"].includes(v.toLowerCase().trim()) : false;
                const toNum = (v?: string) => v ? parseFloat(v.replace(",", ".")) || 0 : 0;

                // Insert social indicators if CadUnico
                if (tipo !== "esus") {
                    await supabaseAdmin.from("indicadores_sociais").insert({
                        familia_id: familiaId,
                        renda_per_capita: toNum(row.renda_per_capita || row.renda),
                        situacao_rua: toBool(row.situacao_rua),
                        moradia_precaria: toBool(row.moradia_precaria),
                        moradia_precaria_barraco: toBool(row.moradia_precaria_barraco || row.barraco),
                        sem_saneamento: toBool(row.sem_saneamento || row.saneamento),
                        tem_crianca_0a6: toBool(row.tem_crianca || row.tem_crianca_0a6),
                        tem_idoso_60plus: toBool(row.tem_idoso || row.tem_idoso_60plus),
                        tem_mae_solo: toBool(row.mae_solo || row.tem_mae_solo),
                        tem_deficiente: toBool(row.deficiente || row.tem_deficiente),
                        responsavel_desempregado: toBool(row.desempregado || row.responsavel_desempregado),
                        baixa_escolaridade: toBool(row.baixa_escolaridade),
                    });
                }

                inseridos++;
            } catch (e: any) {
                erros.push(`Linha ${i + 2}: ${e.message}`);
                ignorados++;
            }
        }

        // Log import
        try {
            await supabaseAdmin.from("importacoes").insert({
                municipio_id: municipioId,
                tipo_importacao: tipo || "cadunico",
                nome_arquivo: file.name,
                registros_importados: inseridos,
                status: inseridos > 0 ? "Concluído" : "Erro",
            });
        } catch { }

        return NextResponse.json({
            sucesso: true,
            inseridos,
            ignorados,
            erros: erros.slice(0, 20), // Return first 20 errors max
            total_processados: rows.length,
        });
    } catch (e: any) {
        return NextResponse.json({ error: `Erro interno: ${e.message}` }, { status: 500 });
    }
}
