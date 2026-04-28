import { hashPassword } from "@/auth";
import { createServerSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const { name, email, password } = body ?? {};
  if (!email || !password || !name) return NextResponse.json({ error: "Tüm alanları doldurun." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Şifre en az 8 karakter olmalı." }, { status: 400 });

  try {
    const supabase = createServerSupabase();
    const { data: existing } = await supabase.from("users").select("id").eq("email", email.toLowerCase()).single();
    if (existing) return NextResponse.json({ error: "Bu e-posta zaten kayıtlı." }, { status: 409 });

    const { hash, salt } = await hashPassword(password);
    const username = email.split("@")[0].replace(/[^a-z0-9]/gi, "_").toLowerCase() + "_" + Math.floor(Math.random() * 9000 + 1000);

    const { error } = await supabase.from("users").insert({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      username,
      password_hash: hash,
      password_salt: salt,
    });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[register]", e);
    return NextResponse.json({ error: "Kayıt hatası: " + String(e) }, { status: 500 });
  }
}
