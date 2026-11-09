"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Code2, Briefcase, ArrowRight, Loader2, ShieldCheck } from "lucide-react";

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selected, setSelected] = useState<"freelancer" | "employer" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/giris?callbackUrl=/onboarding");
  }, [router, status]);

  if (status !== "authenticated") {
    return (
      <div className="onb-page">
        <Loader2 className="spin" size={40} style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userType: selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Hesap türü kaydedilemedi.");
        setLoading(false);
        return;
      }
      const requested = new URLSearchParams(window.location.search).get("callbackUrl");
      const next = requested?.startsWith("/") && !requested.startsWith("//")
        ? new URL(requested, window.location.origin) : null;
      router.replace(next?.origin === window.location.origin && !/^\/(?:api(?:\/|$)|giris(?:\/|$)|onboarding(?:\/|$))/.test(next.pathname)
        ? next.pathname + next.search + next.hash : "/hesabim");
    } catch {
      setError("Bir hata oluştu. Tekrar deneyin.");
      setLoading(false);
    }
  };

  return (
    <div className="onb-page">
      <div className="onb-card glass-card">
        <div className="onb-logo"><span className="gradient-text">Frenaw</span></div>
        <div className="onb-welcome">
          <h1>Hoş Geldiniz, <span className="gradient-text">{session?.user?.name}</span></h1>
          <p>Platforma nasıl katılmak istiyorsunuz? Panelinizi sizin için özelleştirelim.</p>
        </div>

        <div className="onb-choices">
          <button
            className={`onb-choice ${selected === "freelancer" ? "selected" : ""}`}
            onClick={() => setSelected("freelancer")}
          >
            <div className="onb-choice-icon freelancer">
              <Code2 size={32} />
            </div>
            <div className="onb-choice-text">
              <strong>Ben Freelancer&apos;ım</strong>
              <span>İş ilanlarını görüntüle, teklif ver ve el sıkış</span>
            </div>
            <div className={`onb-check ${selected === "freelancer" ? "active" : ""}`}>
              {selected === "freelancer" && <ShieldCheck size={20} />}
            </div>
          </button>

          <button
            className={`onb-choice ${selected === "employer" ? "selected" : ""}`}
            onClick={() => setSelected("employer")}
          >
            <div className="onb-choice-icon employer">
              <Briefcase size={32} />
            </div>
            <div className="onb-choice-text">
              <strong>Ben İşveren&apos;im</strong>
              <span>İş ilanı ver, freelancer bul ve anlaş</span>
            </div>
            <div className={`onb-check ${selected === "employer" ? "active" : ""}`}>
              {selected === "employer" && <ShieldCheck size={20} />}
            </div>
          </button>
        </div>

        {error && <p className="auth-msg error" style={{ marginTop: "12px" }}>{error}</p>}

        <button
          className="btn-primary onb-btn"
          onClick={handleContinue}
          disabled={!selected || loading}
        >
          {loading
            ? <><Loader2 className="spin" size={18} /> Kaydediliyor...</>
            : <>Devam Et <ArrowRight size={18} /></>}
        </button>

        <p className="onb-note">Hesap türünüz, kullanabileceğiniz ilan ve teklif işlemlerini belirler.</p>
      </div>
    </div>
  );
}
