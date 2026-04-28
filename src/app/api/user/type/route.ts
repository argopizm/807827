import { auth } from "@/auth";
import { createServerSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userType } = await request.json().catch(() => ({}));
  if (!["freelancer", "employer"].includes(userType)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  try {
    const supabase = createServerSupabase();
    await supabase.from("users").update({ user_type: userType, onboarding_done: true }).eq("id", session.user.id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ user_type: null, onboarding_done: false });

  try {
    const supabase = createServerSupabase();
    const { data } = await supabase
      .from("users")
      .select("user_type, onboarding_done")
      .eq("id", session.user.id)
      .single();
    return NextResponse.json({ user_type: data?.user_type ?? null, onboarding_done: !!data?.onboarding_done });
  } catch {
    return NextResponse.json({ user_type: null, onboarding_done: false });
  }
}
