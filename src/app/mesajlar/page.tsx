import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { idInput } from "@/lib/private-api";
import ChatClient from "./ChatClient";
import styles from "./chat.module.css";

export const metadata: Metadata = {
  title: "Mesajlar",
  robots: { index: false, follow: false },
};

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>;
}) {
  const to = idInput((await searchParams).to);
  const session = await auth();
  if (!session?.user?.id) {
    const returnTo = to ? "/mesajlar?to=" + encodeURIComponent(to) : "/mesajlar";
    redirect("/giris?callbackUrl=" + encodeURIComponent(returnTo));
  }

  return (
    <section className={`container ${styles.page}`} aria-labelledby="messages-title">
      <header className={styles.heading}>
        <div><span className={styles.kicker}><MessageCircle size={14}/> İŞ BİRLİĞİ BURADA BAŞLAR</span><h1 id="messages-title">Mesajlar</h1><p>Fikirleri konuş, ayrıntıları netleştir. Birlikte iyi işler çıkar.</p></div><span className={styles.headerNote}><ShieldCheck size={18}/> Görüşmelerin yalnızca katılımcılara açık.</span>
      </header>
      <ChatClient recipient={to} />
    </section>
  );
}
