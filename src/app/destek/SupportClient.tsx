"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { supportCategories, supportStatuses } from "@/lib/support";
import styles from "./support.module.css";

type Ticket = {
  id: string;
  subject: string;
  category: keyof typeof supportCategories;
  status: keyof typeof supportStatuses;
  priority: "normal" | "high";
  mine?: number;
  assigned?: number;
};
type Reply = { seq: number; id: string; staff: number; body: string; created_at: string };
type Report = { id: string; reason: string; content: string };
type TicketDetail = { ticket: Ticket; replies: Reply[]; more: boolean };

async function request<T>(query = "", body?: object): Promise<T> {
  const response = await fetch("/api/destek" + query, {
    cache: "no-store",
    ...(body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "İşlem tamamlanamadı.");
  return data;
}

export default function SupportClient() {
  const [tab, setTab] = useState<"own" | "queue" | "reports">("own");
  const [staff, setStaff] = useState(false);
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [more, setMore] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [detail, setDetail] = useState<TicketDetail | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const detailRequest = useRef(0);
  const pendingCreate = useRef<{ id: string; signature: string } | null>(null);
  const pendingReply = useRef<{ id: string; ticket: string; message: FormDataEntryValue | null } | null>(null);

  const refresh = useCallback(async () => {
    try {
      if (tab === "reports") {
        const result = await request<{ reports: Report[] }>("?reports=1");
        setReports(result.reports);
      } else {
        const result = await request<{ tickets: Ticket[]; staff: boolean; more: boolean }>(tab === "queue" ? "?queue=1" : "");
        setTickets(result.tickets);
        setStaff(result.staff);
        setMore(result.more);
      }
    } catch (error) {
      setNotice((error as Error).message);
    }
  }, [tab]);

  useEffect(() => {
    const timer = setTimeout(refresh, 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  async function openTicket(id: string) {
    const requestId = ++detailRequest.current;
    try {
      const result = await request<TicketDetail>("?ticket=" + id);
      if (requestId === detailRequest.current) setDetail(result);
    } catch (error) {
      if (requestId === detailRequest.current) setNotice((error as Error).message);
    }
  }

  function changeTab(next: typeof tab) {
    detailRequest.current++;
    setTab(next);
    setDetail(null);
    setNotice("");
    setTickets(null);
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const signature = JSON.stringify([...values.entries()]);
    if (pendingCreate.current?.signature !== signature) pendingCreate.current = { id: crypto.randomUUID(), signature };
    setBusy(true);
    setNotice("");
    try {
      const { id } = await request<{ id: string }>("", {
        action: "create", id: pendingCreate.current.id, subject: values.get("subject"), category: values.get("category"), message: values.get("message"),
      });
      form.reset();
      pendingCreate.current = null;
      setNotice("Destek talebin oluşturuldu.");
      await Promise.all([openTicket(id), refresh()]);
    } catch (error) {
      setNotice((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function reply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!detail) return;
    const form = event.currentTarget;
    const message = new FormData(form).get("message");
    const ticket = detail.ticket.id;
    if (pendingReply.current?.ticket !== ticket || pendingReply.current.message !== message) {
      pendingReply.current = { id: crypto.randomUUID(), ticket, message };
    }
    setBusy(true);
    setNotice("");
    try {
      await request("", { action: "reply", id: ticket, message, replyId: pendingReply.current.id });
      pendingReply.current = null;
      form.reset();
      await Promise.all([openTicket(ticket), refresh()]);
    } catch (error) {
      setNotice((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function manage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!detail) return;
    const id = detail.ticket.id;
    const values = new FormData(event.currentTarget);
    setBusy(true);
    setNotice("");
    try {
      await request("", {
        action: "manage", id, status: values.get("status"), priority: values.get("priority"), assignment: values.get("assignment"),
      });
      setNotice("Talep güncellendi.");
      await Promise.all([openTicket(id), refresh()]);
    } catch (error) {
      setNotice((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function loadMoreTickets() {
    setBusy(true);
    try {
      const result = await request<{ tickets: Ticket[]; more: boolean }>("?offset=" + (tickets?.length ?? 0) + (tab === "queue" ? "&queue=1" : ""));
      setTickets((current) => [...(current ?? []), ...result.tickets.filter((ticket) => !current?.some((item) => item.id === ticket.id))]);
      setMore(result.more);
    } catch (error) {
      setNotice((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function loadOlder() {
    if (!detail?.replies.length) return;
    const id = detail.ticket.id;
    try {
      const older = await request<TicketDetail>("?ticket=" + id + "&before=" + detail.replies[0].seq);
      setDetail((current) => current?.ticket.id === id ? {
        ...current,
        more: older.more,
        replies: [...older.replies.filter((reply) => !current.replies.some((item) => item.id === reply.id)), ...current.replies],
      } : current);
    } catch (error) {
      setNotice((error as Error).message);
    }
  }

  async function resolveReport(id: string) {
    setBusy(true);
    try {
      await request("", { action: "resolveReport", id });
      await refresh();
    } catch (error) {
      setNotice((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {staff && <div className={styles.tabs} aria-label="Destek görünümü">
        <button className={styles.secondary} aria-pressed={tab === "own"} onClick={() => changeTab("own")}>Taleplerim</button>
        <button className={styles.secondary} aria-pressed={tab === "queue"} onClick={() => changeTab("queue")}>Destek kuyruğu</button>
        <button className={styles.secondary} aria-pressed={tab === "reports"} onClick={() => changeTab("reports")}>Mesaj bildirimleri</button>
      </div>}
      {notice && <p className={styles.notice} role="status">{notice}</p>}
      {tab === "reports" ? <section className={styles.card}>
        <h2>Mesaj bildirimleri</h2>
        {reports.length === 0 && <p>Açık bildirim bulunmuyor.</p>}
        {reports.map((report) => <article className={styles.reply} key={report.id}>
          <strong>{report.reason}</strong>
          <p>{report.content}</p>
          <button className={styles.secondary} onClick={() => resolveReport(report.id)} disabled={busy}>İncelendi olarak işaretle</button>
        </article>)}
      </section> : <div className={styles.layout}>
        <div>
          {tab === "own" && <section className={styles.card}>
            <h2>Yeni destek talebi</h2>
            <form className={styles.form} onSubmit={create}>
              <label>Konu<input name="subject" maxLength={120} required /></label>
              <label>Kategori<select name="category" defaultValue="technical">
                {Object.entries(supportCategories).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select></label>
              <label>Açıklama<textarea name="message" rows={5} maxLength={5000} required /></label>
              <p className={styles.help}>T.C. kimlik numaranı, parolanı veya ödeme bilgilerini paylaşma.</p>
              <button className="btn-primary" disabled={busy}>Talep oluştur</button>
            </form>
          </section>}
          <section className={`${styles.card} ${styles.detail}`}>
            <h2>{tab === "queue" ? "Destek kuyruğu" : "Taleplerim"}</h2>
            <div className={styles.list}>
              {tickets === null && <p>Yükleniyor…</p>}
              {tickets?.length === 0 && <p>Talep bulunmuyor.</p>}
              {tickets?.map((ticket) => <button className={styles.item} key={ticket.id} onClick={() => openTicket(ticket.id)}
                aria-current={ticket.id === detail?.ticket.id}>
                <strong>{ticket.subject}</strong>
                <small>{supportCategories[ticket.category]} · {supportStatuses[ticket.status]}{ticket.priority === "high" ? " · Yüksek öncelik" : ""}</small>
              </button>)}
            </div>
            {more && <button className={styles.secondary} disabled={busy} onClick={loadMoreTickets}>Daha fazla talep</button>}
          </section>
        </div>
        <section className={styles.card} aria-label="Talep ayrıntısı">
          {!detail ? <p>Ayrıntılarını görmek için bir talep seç.</p> : <>
            <h2>{detail.ticket.subject}</h2>
            <button className={styles.secondary} onClick={() => openTicket(detail.ticket.id)}>Yanıtları yenile</button>
            <p className={styles.help}>{supportStatuses[detail.ticket.status]} · Talep {detail.ticket.id}</p>
            {detail.more && <button className={styles.secondary} onClick={loadOlder}>Önceki yanıtlar</button>}
            {detail.replies.map((message) => <article className={styles.reply} key={message.id}>
              <strong>{message.staff ? "Frenaw destek" : "Talep sahibi"}</strong>
              <p>{message.body}</p>
              <small className={styles.date}>{message.created_at}</small>
            </article>)}
            {detail.ticket.status !== "resolved" && <form className={styles.form} onSubmit={reply} key={detail.ticket.id}>
              <label>Yanıt<textarea name="message" rows={3} maxLength={5000} required /></label>
              <button className="btn-primary" disabled={busy}>Yanıt gönder</button>
            </form>}
            {tab === "queue" && <form className={`${styles.form} ${styles.manage}`} onSubmit={manage}
              key={detail.ticket.id + detail.ticket.status + detail.ticket.priority + detail.ticket.assigned}>
              <label>Durum<select name="status" defaultValue={detail.ticket.status}>
                {Object.entries(supportStatuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select></label>
              <label>Öncelik<select name="priority" defaultValue={detail.ticket.priority}>
                <option value="normal">Normal</option><option value="high">Yüksek</option>
              </select></label>
              <label>Atama<select name="assignment" defaultValue={detail.ticket.assigned ? "claim" : "release"}>
                <option value="release">Ortak kuyruk</option><option value="claim">Kendime ata</option>
              </select></label>
              <button className={styles.secondary} disabled={busy}>Ayarları kaydet</button>
            </form>}
          </>}
        </section>
      </div>}
    </>
  );
}
