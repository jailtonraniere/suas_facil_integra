import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createServerSupabaseClient(): Promise<ReturnType<typeof createServerClient<Database>>> {
    // @ts-expect-error - cookies() API varies between Next.js versions
    const cookieStore = cookies();
    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                // @ts-expect-error - cookie store type varies
                getAll() { return cookieStore.getAll(); },
                // @ts-expect-error - cookie store type varies
                setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options?: Record<string, unknown> }) =>
                            // @ts-expect-error - cookie store type varies
                            cookieStore.set(name, value, options)
                        );
                    } catch { /* ignore server component calls */ }
                },
            },
        }
    );
}
