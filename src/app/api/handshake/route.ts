export const runtime = 'edge';

import { auth } from "@/auth";
import { createServerSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Bu işlem için giriş yapmanız gerekiyor." }, { status: 401 });
  }

  const freelancerId = session.user.id;
  const body = await request.json().catch(() => null);
  const { jobId, clientId } = body ?? {};

  if (!jobId || !clientId) {
    return NextResponse.json({ error: "jobId ve clientId gerekli." }, { status: 400 });
  }
  if (freelancerId === clientId) {
    return NextResponse.json({ error: "Kendi ilanınıza teklif gönderemezsiniz." }, { status: 400 });
  }

  try {
    const supabase = createServerSupabase();

    // İlanı kontrol et
    const { data: job } = await supabase.from("jobs").select("id, is_active").eq("id", jobId).single();
    if (!job) return NextResponse.json({ error: "İlan bulunamadı." }, { status: 404 });
    if (!job.is_active) return NextResponse.json({ error: "Bu ilan artık aktif değil." }, { status: 400 });

    // Daha önce başvuru var mı?
    const { data: existing } = await supabase
      .from("handshakes")
      .select("id")
      .eq("job_id", jobId)
      .eq("sender_id", freelancerId)
      .neq("status", "cancelled")
      .single();

    if (existing) return NextResponse.json({ error: "Bu iş için zaten bir talebiniz var." }, { status: 409 });

    // Handshake oluştur
    const { data: handshake, error } = await supabase
      .from("handshakes")
      .insert({ job_id: jobId, sender_id: freelancerId, receiver_id: clientId, status: "pending" })
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, message: "El sıkışma talebi gönderildi.", id: handshake.id });
  } catch (e) {
    console.error("[handshake]", e);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
