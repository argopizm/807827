export const runtime = 'edge';

import { createServerSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const result: Record<string, unknown> = {
    supabase_url: !!(process.env.SUPABASE_URL),
    service_role_key: !!(process.env.SUPABASE_SERVICE_ROLE_KEY),
    anon_key: !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY),
    auth_secret: !!(process.env.AUTH_SECRET),
    google_client_id: !!(process.env.GOOGLE_CLIENT_ID),
    db_connected: false,
    user_count: null,
    error: null,
  };

  try {
    const supabase = createServerSupabase();
    const { count, error } = await supabase.from("users").select("*", { count: "exact", head: true });
    if (error) throw error;
    result.db_connected = true;
    result.user_count = count;
  } catch (e) {
    result.error = String(e);
  }

  return NextResponse.json(result);
}
