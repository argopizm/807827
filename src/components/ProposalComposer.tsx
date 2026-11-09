"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, CheckCircle2, ClipboardPen, Loader2, Send, X } from "lucide-react";
import { parseProposalAmount, proposalPrice, type SavedProposal } from "@/lib/proposals";
import ProposalSummary from "./ProposalSummary";
import styles from "./Proposal.module.css";

export default function ProposalComposer({ jobId, title }: { jobId: string; title: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [proposal, setProposal] = useState<SavedProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [revision, setRevision] = useState(0);
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("");
  const [days, setDays] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let stopped = false;
    fetch("/api/handshake?jobId="+encodeURIComponent(jobId), { cache:"no-store" }).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Teklif yüklenemedi.");
      if (!stopped) { setProposal(data.proposal); setLoadError(""); }
    }).catch(error => { if (!stopped) setLoadError(error.message); }).finally(()=>{ if (!stopped) setLoading(false); });
    return ()=>{ stopped=true; };
  }, [jobId, revision]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    if (parseProposalAmount(amount) === null || !Number.isInteger(Number(days)) || Number(days)<1 || Number(days)>365 || Array.from(message.trim()).length<20) { setError("Açıklama, TL fiyatı ve teslim süresini kontrol et."); return; }
    setBusy(true);
    try {
      const response=await fetch("/api/handshake",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jobId,message,amount,deliveryDays:Number(days)})});
      const data=await response.json();
      if(!response.ok) { if(response.status===409) setRevision(v=>v+1); throw new Error(data.error || "Teklif gönderilemedi."); }
      setProposal(data.proposal); dialog.current?.close();
    } catch(error) { setError((error as Error).message); }
    finally { setBusy(false); }
  }
  if(loading) return <div className={styles.loading} role="status"><Loader2 size={17} className="spin"/> Teklifin kontrol ediliyor…</div>;
  if(loadError) return <div className={styles.loadError}><p role="alert">{loadError}</p><button onClick={()=>{setLoading(true);setRevision(v=>v+1);}}>Tekrar dene</button></div>;
  if(proposal) return <div className={styles.existing}><span className={styles.success} role="status"><CheckCircle2 size={18}/> {proposal.status==="pending" ? "Teklifin iletildi." : proposal.status==="accepted" ? "Teklifin kabul edildi." : "Teklifin kayıtlı."}</span><ProposalSummary proposal={proposal}/><Link className={styles.manage} href="/hesabim">Başvurularımı aç <ArrowUpRight size={15}/></Link></div>;
  return <>
    <button className={styles.trigger} onClick={()=>dialog.current?.showModal()}><ClipboardPen size={18}/> Teklifini hazırla</button>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="proposal-title" onCancel={event=>{if(busy)event.preventDefault();}}>
      <div className={styles.dialogHead}><span><ClipboardPen size={23}/></span><button type="button" aria-label="Teklif formunu kapat" disabled={busy} onClick={()=>dialog.current?.close()}><X size={20}/></button></div>
      <h2 id="proposal-title">İyi bir iş birliği, net bir teklifle başlar.</h2><p className={styles.project}>{title}</p>
      <form onSubmit={submit} className={styles.form}>
        <label>Teklif açıklaman<textarea value={message} onChange={event=>setMessage(event.target.value)} minLength={20} maxLength={4000} rows={5} required placeholder="Projeyi nasıl ele alacağını, neleri teslim edeceğini ve revizyon kapsamını anlat."/><small>En az 20 karakter · {Array.from(message).length}/4000</small></label>
        <div className={styles.row}><label>Teklif fiyatın (TL)<input inputMode="decimal" value={amount} onChange={event=>setAmount(event.target.value)} pattern="[0-9]+([.,][0-9]{1,2})?" maxLength={11} required placeholder="Örn. 2500,50"/><small>Toplam fiyat · Binlik ayırıcı kullanma.</small></label><label>Teslim süresi (gün)<input type="number" min={1} max={365} step={1} value={days} onChange={event=>setDays(event.target.value)} required placeholder="Örn. 7"/><small>Başlangıç ve takvimi işverenle netleştir.</small></label></div>
        <div className={styles.preview}><span>Teklif özeti</span><strong>{parseProposalAmount(amount)!==null ? proposalPrice(parseProposalAmount(amount)!) : "Fiyatını gir"} <i>·</i> {days ? days+" gün" : "Teslim süreni gir"}</strong><small>Frenaw platform komisyonu almaz; ödeme taraflar arasında gerçekleşir.</small></div>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <div className={styles.actions}><button type="button" disabled={busy} onClick={()=>dialog.current?.close()}>Vazgeç</button><button className={styles.trigger} disabled={busy}>{busy ? <><Loader2 size={17} className="spin"/> Gönderiliyor…</> : <><Send size={17}/> Teklifi gönder</>}</button></div>
      </form>
    </dialog>
  </>;
}
