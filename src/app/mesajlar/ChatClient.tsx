"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, CheckCheck, ChevronDown, CircleHelp, Flag, Loader2, MessageCircle, MessagesSquare, MoreHorizontal, Search, Send, ShieldCheck, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { foldTurkish } from "@/lib/categories";
import styles from "./chat.module.css";

const api = "/api/mesajlar";

type Thread = {
  id: string;
  other_name: string;
  other_username?: string | null;
  updated_at?: string;
  last_content?: string;
  unread?: number;
  blocked?: number;
  other_last_read_seq?: number;
};

type Message = {
  seq: number;
  id: string;
  mine: number;
  content: string;
  created_at: string;
};

async function chatRequest<T>(query = "", body?: object): Promise<T> {
  const response = await fetch(api + query, {
    cache: "no-store",
    ...(body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "İşlem tamamlanamadı.");
  return data;
}

function useChatConnection(update: () => void) {
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    let stopped = false;
    let socket: WebSocket | undefined;
    let retry: ReturnType<typeof setTimeout> | undefined;

    function schedule() {
      if (!stopped) retry = setTimeout(connect, 30_000);
    }

    async function connect() {
      try {
        const { url, ticket } = await chatRequest<{ url?: string; ticket?: string }>("", { action: "connect" });
        if (stopped) return;
        if (!url || !ticket) {
          schedule();
          return;
        }
        socket = new WebSocket(url, ["frenaw.v1", "ticket." + ticket]);
        socket.addEventListener("open", () => {
          if (stopped) return;
          setConnected(true);
          update();
        });
        socket.addEventListener("message", () => {
          if (!stopped) update();
        });
        socket.addEventListener("close", () => {
          if (stopped) return;
          setConnected(false);
          schedule();
        });
      } catch {
        schedule();
      }
    }

    void connect();
    return () => {
      stopped = true;
      clearTimeout(retry);
      socket?.close();
    };
  }, [update]);
  return connected;
}

function mergeMessages(current: Message[], next: Message[]) {
  const merged = new Map(current.map((message) => [message.seq, message]));
  for (const message of next) merged.set(message.seq, message);
  return [...merged.values()].sort((a, b) => a.seq - b.seq);
}

function timeLabel(value: string) {
  const date = new Date(value.includes("T") ? value : value.replace(" ", "T") + "Z");
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("tr-TR", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function dayLabel(value: string) {
  const date = new Date(value.includes("T") ? value : value.replace(" ", "T") + "Z");
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("tr-TR", { day:"numeric", month:"long", year:"numeric" });
}

function Avatar({ name }: { name: string }) { return <span className={styles.avatar} aria-hidden="true">{name.trim().slice(0,1).toLocaleUpperCase("tr-TR") || "F"}</span>; }

function Conversation({ id, revision, connected, close, onRead }: {
  id: string; revision: number; connected: boolean; close: () => void; onRead: () => void;
}) {
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [older, setOlder] = useState(false);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const lastSeq = useRef(0);
  const lastRead = useRef(0);
  const inFlight = useRef(false);
  const rerun = useRef(false);
  const syncRef = useRef<(() => void) | null>(null);
  const pendingSend = useRef<{ id: string; text: string } | null>(null);
  const log = useRef<HTMLDivElement>(null);
  const pinnedToEnd = useRef(true);

  useEffect(() => {
    let stopped = false;
    async function sync() {
      if (stopped || document.visibilityState === "hidden") return;
      if (inFlight.current) {
        rerun.current = true;
        return;
      }
      inFlight.current = true;
      try {
        do {
          rerun.current = false;
          let from = lastSeq.current;
          let backlog = true;
          while (backlog && !stopped) {
            const data = await chatRequest<{ thread: Thread; messages: Message[]; more: boolean }>(
              "?thread=" + id + (from ? "&after=" + from : ""),
            );
            if (stopped) return;
            setThread(data.thread);
            if (!from) setOlder(data.more);
            const next = data.messages.at(-1)?.seq ?? from;
            if (data.messages.length) {
              lastSeq.current = Math.max(lastSeq.current, next);
              setMessages((current) => mergeMessages(current, data.messages));
            }
            // The initial page describes older history. Forward pages describe reconnect backlog.
            backlog = from > 0 && data.more && next > from;
            from = next;
          }
          const seq = lastSeq.current;
          if (!stopped && document.visibilityState === "visible" && seq > lastRead.current) {
            await chatRequest("", { action: "read", threadId: id, seq });
            if (!stopped) {
              lastRead.current = seq;
              onRead();
            }
          }
        } while (rerun.current && !stopped && document.visibilityState === "visible");
      } catch (error) {
        if (!stopped) setNotice((error as Error).message);
      } finally {
        inFlight.current = false;
      }
    }
    const run = () => { void sync(); };
    syncRef.current = run;
    run();
    document.addEventListener("visibilitychange", run);
    return () => {
      stopped = true;
      syncRef.current = null;
      document.removeEventListener("visibilitychange", run);
    };
  }, [id, onRead]);

  useEffect(() => {
    syncRef.current?.();
  }, [revision]);

  useEffect(() => {
    const timer = setInterval(() => syncRef.current?.(), connected ? 20_000 : 3_000);
    return () => clearInterval(timer);
  }, [connected]);

  useEffect(() => {
    if (pinnedToEnd.current && log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages]);

  async function loadOlder() {
    if (!messages.length) return;
    try {
      pinnedToEnd.current = false;
      const data = await chatRequest<{ messages: Message[]; more: boolean }>(
        "?thread=" + id + "&before=" + messages[0].seq,
      );
      setOlder(data.more);
      setMessages((current) => mergeMessages(current, data.messages));
    } catch (error) {
      setNotice((error as Error).message);
    }
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || busy) return;
    if (pendingSend.current?.text !== text) pendingSend.current = { id: crypto.randomUUID(), text };
    setBusy(true);
    setNotice("");
    try {
      const { message } = await chatRequest<{ message: Message }>("", {
        action: "send", threadId: id, messageId: pendingSend.current.id, content: text,
      });
      pinnedToEnd.current = true;
      setMessages((current) => mergeMessages(current, [message]));
      setDraft((current) => current.trim() === text ? "" : current);
      pendingSend.current = null;
      onRead();
    } catch (error) {
      setNotice((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function changeBlock() {
    if (!thread) return;
    try {
      const blocked = !thread.blocked;
      await chatRequest("", { action: "block", threadId: id, blocked });
      setThread({ ...thread, blocked: blocked ? 1 : 0 });
      setNotice(blocked ? "Kullanıcı engellendi." : "Engel kaldırıldı.");
    } catch (error) {
      setNotice((error as Error).message);
    }
  }

  async function report(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const reason = new FormData(event.currentTarget).get("reason");
    try {
      await chatRequest("", { action: "report", threadId: id, messageId: reportId, reason });
      setReportId(null);
      setNotice("Şikâyetin inceleme için alındı.");
    } catch (error) {
      setNotice((error as Error).message);
    }
  }

  return <div className={styles.panel}>
    <header className={styles.roomHead}>
      <button type="button" className={styles.back} onClick={close} aria-label="Konuşma listesine dön"><ArrowLeft size={20}/></button>
      <Avatar name={thread?.other_name ?? ""}/><div className={styles.roomPerson}><h2>{thread?.other_name ?? "Konuşma yükleniyor…"}</h2><span className={styles.connection} data-live={connected}><i/>{connected ? "Canlı mesaj bağlantısı" : "Mesajlar düzenli güncellenir"}</span></div>
      {thread && <details className={styles.roomMenu}><summary aria-label="Konuşma seçenekleri"><MoreHorizontal size={21}/></summary><div>{thread.other_username && <Link href={"/profil/"+encodeURIComponent(thread.other_username)}>Profili görüntüle <ArrowUpRight size={15}/></Link>}<button type="button" onClick={changeBlock}>{thread.blocked ? "Engeli kaldır" : "Kullanıcıyı engelle"}</button><Link href="/destek">Destek merkezine git <CircleHelp size={15}/></Link></div></details>}
    </header>
    <div className={styles.log} role="log" aria-label="Mesaj geçmişi" aria-live="polite" aria-relevant="additions" ref={log} onScroll={event=>{const area=event.currentTarget;pinnedToEnd.current=area.scrollHeight-area.clientHeight-area.scrollTop<80;}}>
      {older && <button type="button" className={styles.older} onClick={loadOlder}><ChevronDown size={14}/> Daha eski mesajlar</button>}
      {messages.length===0 && <div className={styles.roomEmpty}><span><MessageCircle size={28}/></span><h3>{thread ? "Bir merhaba ile başla." : "Konuşman hazırlanıyor."}</h3><p>{thread ? "Projeyi, beklentilerini ve aklındaki soruları paylaş." : "Mesaj geçmişin yükleniyor…"}</p></div>}
      {messages.map((message,index)=><div className={styles.messageGroup} key={message.id}>
        {(index===0 || dayLabel(messages[index-1].created_at)!==dayLabel(message.created_at)) && <div className={styles.day}><span>{dayLabel(message.created_at)}</span></div>}
        <article className={styles.bubble} data-own={Boolean(message.mine)}><p>{message.content}</p><div className={styles.messageMeta}><small>{timeLabel(message.created_at)}</small>{message.mine && <span aria-label={message.seq<=(thread?.other_last_read_seq??0) ? "Okundu" : "Gönderildi"}>{message.seq<=(thread?.other_last_read_seq??0) ? <CheckCheck size={15}/> : <Check size={14}/>}</span>}{!message.mine && <button className={styles.report} type="button" aria-label="Mesajı bildir" title="Mesajı bildir" onClick={()=>setReportId(reportId===message.id ? null : message.id)}><Flag size={12}/></button>}</div>
          {reportId===message.id && <form className={styles.reportForm} onSubmit={report}><label>Bildirme nedeni<input name="reason" aria-label="Şikâyet nedeni" placeholder="Sorunu kısaca anlat" maxLength={500} required/></label><button type="submit" className={styles.plain}>Bildir</button><button type="button" className={styles.plain} onClick={()=>setReportId(null)}>Vazgeç</button></form>}
        </article>
      </div>)}
    </div>
    {notice && <p className={styles.status} role="status">{notice}</p>}
    <div className={styles.composerArea}><form onSubmit={send} className={styles.composer}>
      <textarea aria-label="Mesaj" placeholder={thread?.blocked ? "Bu kullanıcı engellendi." : "Bir mesaj yaz…"} rows={2} maxLength={4000} value={draft} onChange={event=>setDraft(event.target.value)} onKeyDown={event=>{if((event.ctrlKey || event.metaKey)&&event.key==="Enter"&&!event.nativeEvent.isComposing){event.preventDefault();event.currentTarget.form?.requestSubmit();}}} disabled={!thread||Boolean(thread.blocked)}/>
      <button aria-label={busy ? "Mesaj gönderiliyor" : "Mesaj gönder"} disabled={!thread||Boolean(thread.blocked)||busy||!draft.trim()}>{busy ? <Loader2 className="spin" size={19}/> : <Send size={19}/>}</button>
    </form><div className={styles.composerHint}><span>Ctrl / ⌘ + Enter ile gönder</span><span>{draft.length}/4000</span></div></div>
  </div>;
}
export default function ChatClient({ recipient }: { recipient: string | null }) {
  const [threads, setThreads] = useState<Thread[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const nextOffset = useRef(30);
  const update = useCallback(() => setRevision((value) => value + 1), []);
  const connected = useChatConnection(update);
  const filtered = useMemo(() => (threads ?? []).filter(thread => (!unreadOnly || Boolean(thread.unread)) && foldTurkish(thread.other_name+" "+(thread.last_content ?? "")).includes(foldTurkish(search))), [threads, search, unreadOnly]);

  useEffect(() => {
    let stopped = false;
    async function sync() {
      if (document.visibilityState === "hidden") return;
      try {
        const data = await chatRequest<{ threads: Thread[]; more: boolean }>();
        if (!stopped) {
          setThreads((current) => {
            const latestIds = new Set(data.threads.map((thread) => thread.id));
            return [...data.threads, ...(current ?? []).filter((thread) => !latestIds.has(thread.id))];
          });
          if (nextOffset.current === 30) setHasMore(data.more);
        }
      } catch (error) {
        if (!stopped) { setThreads(current=>current ?? []); setNotice((error as Error).message); }
      }
    }
    void sync();
    const timer = setInterval(sync, connected ? 20_000 : 5_000);
    document.addEventListener("visibilitychange", sync);
    return () => {
      stopped = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [connected, revision]);

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const data = await chatRequest<{ threads: Thread[]; more: boolean }>("?offset=" + nextOffset.current);
      setThreads((current) => {
        const ids = new Set((current ?? []).map((thread) => thread.id));
        return [...(current ?? []), ...data.threads.filter((thread) => !ids.has(thread.id))];
      });
      nextOffset.current += 30;
      setHasMore(data.more);
    } catch (error) {
      setNotice((error as Error).message);
    } finally {
      setLoadingMore(false);
    }
  }

  async function start() {
    setNotice("");
    setBusy(true);
    try {
      const { threadId } = await chatRequest<{ threadId: string }>("", { action: "start", to: recipient });
      setSelected(threadId);
      setDismissed(true);
      update();
    } catch (error) {
      setNotice((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return <>
    {recipient&&!dismissed && <div className={styles.initiate}><span><MessageCircle size={22}/></span><div><strong>Yeni bir iş birliği için ilk adım.</strong><p>Profilinden geldiğin kişiyle özel bir görüşme aç.</p></div><button onClick={start} disabled={busy}>{busy ? <><Loader2 size={16} className="spin"/> Açılıyor…</> : <>Sohbeti başlat <ArrowUpRight size={16}/></>}</button></div>}
    {notice && <div className={styles.topNotice}><p role="status">{notice}</p><button onClick={update}>Tekrar dene</button></div>}
    <div className={styles.shell} data-room={Boolean(selected)}>
      <aside className={styles.sidebar} aria-label="Konuşma listesi"><div className={styles.sideHead}><div><MessagesSquare size={18}/><h2>Görüşmelerin</h2></div><span>{threads?.length ?? "—"}</span></div>
        <label className={styles.search}><Search size={16}/><input aria-label="Yüklenen konuşmalarda ara" placeholder="Kişi veya son mesajı ara" maxLength={100} value={search} onChange={event=>setSearch(event.target.value)}/></label>
        <div className={styles.tabs} aria-label="Konuşma filtresi"><button aria-pressed={!unreadOnly} onClick={()=>setUnreadOnly(false)}>Tümü</button><button aria-pressed={unreadOnly} onClick={()=>setUnreadOnly(true)}>Okunmamış {threads?.some(thread=>thread.unread) && <i/>}</button></div>
        <div className={styles.threadArea}>{threads===null ? <div className={styles.skeletons} role="status" aria-label="Konuşmalar yükleniyor">{[0,1,2,3].map(i=><div key={i}><span/><p><i/><i/></p></div>)}</div> : !filtered.length ? <div className={styles.listEmpty}><MessageCircle size={27}/><strong>{search||unreadOnly ? "Eşleşen görüşme yok." : "Henüz bir görüşmen yok."}</strong><p>{search||unreadOnly ? "Aramayı veya okunmamış filtresini değiştirebilirsin." : "Bir profil veya proje ilanı üzerinden ilk konuşmanı başlat."}</p><Link href="/profil">Uzmanları keşfet <ArrowUpRight size={14}/></Link></div> : <div className={styles.threads}>{filtered.map(thread=><button type="button" className={styles.thread} key={thread.id} onClick={()=>setSelected(thread.id)} aria-current={selected===thread.id}><Avatar name={thread.other_name}/><span className={styles.threadCopy}><strong>{thread.other_name}</strong><small>{thread.last_content || "Yeni bir konuşma"}</small></span><span className={styles.threadMeta}>{thread.updated_at && <time>{timeLabel(thread.updated_at).split(" ").slice(0,2).join(" ")}</time>}{Boolean(thread.unread)&&<span className={styles.count} aria-label={thread.unread+" okunmamış mesaj"}>{thread.unread!>99 ? "99+" : thread.unread}</span>}</span></button>)}</div>}
        {hasMore&&<button className={styles.older} onClick={loadMore} disabled={loadingMore}>{loadingMore ? "Yükleniyor…" : "Daha eski konuşmalar"}</button>}</div>
        <div className={styles.sideFoot}><ShieldCheck size={14}/><span>Görüşmelerin katılımcılara özeldir.</span></div>
      </aside>
      {selected ? <Conversation key={selected} id={selected} connected={connected} revision={revision} onRead={update} close={()=>setSelected(null)}/> : <div className={styles.welcome}><div className={styles.welcomeArt} aria-hidden="true"><span><MessageCircle size={35}/></span><div><i/><i/><i/></div><small><Sparkles size={17}/></small></div><span className={styles.kicker}>BİRLİKTE ÜRETMEYE BİR MESAJ UZAKTASIN</span><h2>İyi işler, iyi bir<br/>konuşmayla başlar.</h2><p>Soldan bir görüşme seç. Projenin ayrıntılarını konuş, sorularını sor ve birlikte net bir başlangıç yap.</p><Link href="/ilanlar">Projeleri keşfet <ArrowUpRight size={16}/></Link><span className={styles.welcomeNote}><ShieldCheck size={14}/> Kimseye şifreni veya kimlik bilgilerini gönderme.</span></div>}
    </div>
  </>;
}