import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST() {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Invoke Edge Function
        const { data, error } = await supabase.functions.invoke("recalcular-score", {
            body: { motivo: "manual" },
        });
        if (error) throw error;

        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
