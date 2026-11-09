"use client";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, Plus, Search, X } from "lucide-react";
import { canonicalSkill, normalizeSkills, skillSuggestions } from "@/lib/skills";
import styles from "./SkillPicker.module.css";

export default function SkillPicker({ value, onChange, category }: { value: string[]; onChange: (value: string[]) => void; category: string }) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [message, setMessage] = useState("");
  const suggestions = skillSuggestions(query, category, value);
  const manual = canonicalSkill(query);
  const canCreate = Boolean(manual && manual.length <= 50 && !suggestions.some((item) => item.label === manual) && normalizeSkills([...value,manual]).length > value.length);
  const choices = [...suggestions.map((item) => item.label), ...(canCreate ? [manual] : [])];
  const expanded = open && value.length < 20;
  function add(label: string) {
    const next = normalizeSkills([...value, label]);
    if (next.length > 20) { setMessage("En fazla 20 yetenek ekleyebilirsin."); return; }
    if (next.length === value.length) { setMessage("Bu etiket zaten ekli veya 50 karakter sınırını aşıyor."); return; }
    onChange(next); setQuery(""); setActive(0); setMessage(label + " eklendi."); input.current?.focus();
  }
  function keydown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") { setOpen(false); return; }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setOpen(true); setActive((current) => choices.length ? (current + (event.key === "ArrowDown" ? 1 : -1) + choices.length) % choices.length : 0); }
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault(); if (expanded && choices[active]) add(choices[active]); else if (manual) add(manual);
    }
    if (event.key === "Backspace" && !query && value.length) { onChange(value.slice(0,-1)); setMessage("Son etiket kaldırıldı."); }
  }
  return <div className={styles.picker} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <div className={styles.label}><label htmlFor={id}>Yeteneklerin</label><span>{value.length}/20</span></div>
    <div className={styles.tags}>{value.map((label) => <span className={styles.chip} key={label}>{label}<button type="button" aria-label={label + " etiketini kaldır"} onClick={() => onChange(value.filter((item) => item !== label))}><X size={13}/></button></span>)}</div>
    <div className={styles.input}><Search size={17} aria-hidden="true"/><input id={id} ref={input} role="combobox" aria-expanded={expanded} aria-controls={expanded ? id + "-list" : undefined} aria-autocomplete="list" aria-activedescendant={expanded && choices[active] ? id + "-" + active : undefined} aria-describedby={id + "-hint"} value={query} maxLength={50} disabled={value.length >= 20} onChange={(event) => { setQuery(event.target.value); setActive(0); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={keydown} placeholder={value.length >= 20 ? "20 yetenek seçtin" : "React, logo tasarımı, Excel…"}/></div>
    <p id={id + "-hint"} className={styles.hint}>Önerilerden seç veya kendi yeteneğini yazıp Enter’a bas.</p>
    {expanded && <div className={styles.dropdown}><div className={styles.caption}>{query ? "Eşleşen yetenekler" : "Sana uygun öneriler"}</div><ul id={id + "-list"} role="listbox" aria-label="Yetenek önerileri">{suggestions.map((item,index) => <li id={id + "-" + index} key={item.label} role="option" aria-selected={index === active} onPointerMove={() => setActive(index)}><button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => add(item.label)}><span><strong>{item.label}</strong><small>{item.categoryTitle}</small></span><Plus size={16}/></button></li>)}{canCreate && <li id={id + "-" + suggestions.length} role="option" aria-selected={active === suggestions.length}><button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => add(manual)}><span><strong>“{manual}” ekle</strong><small>Kendi yeteneğin</small></span><Check size={16}/></button></li>}{!choices.length && <li className={styles.empty}>Bu etiket zaten ekli. Başka bir yetenek yazabilirsin.</li>}</ul></div>}
    <span className={styles.sr} aria-live="polite">{message}</span>
  </div>;
}
