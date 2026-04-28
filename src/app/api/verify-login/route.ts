import { verifyPassword } from "@/auth";
import { createServerSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}));
  if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  try {
    const supabase = createServerSupabase();
    const { data: user } = await supabase
      .from("users")
      .select("id, email, name, image, password_hash, password_salt")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 401 });
    if (!user.password_hash || !user.password_salt) {
      return NextResponse.json({ error: "Google hesabı. Google ile giriş yapın." }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash, user.password_salt);
    if (!valid) return NextResponse.json({ error: "Wrong password" }, { status: 401 });

    return NextResponse.json({ id: user.id, email: user.email, name: user.name, image: user.image });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
