import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import CategoryImage from "@/components/CategoryImage";
import type { Guide } from "@/lib/guides";
import styles from "./guides.module.css";

export type GuideSummary = Pick<Guide, "slug" | "title" | "description" | "topic" | "image"> & { readTime: number };

export default function GuideCard({ guide }: { guide: GuideSummary }) {
  return <Link className={styles.card} href={"/rehber/" + guide.slug}>
    <div className={styles.cardPhoto}><CategoryImage slug={guide.image} title={guide.title} /><span className={styles.photoArrow}><ArrowUpRight size={21} aria-hidden="true" /></span></div>
    <div className={styles.cardCopy}><div className={styles.cardMeta}><span>{guide.topic}</span><span><Clock3 size={13} aria-hidden="true" /> {guide.readTime} dk</span></div><h3>{guide.title}</h3><p>{guide.description}</p><span className={styles.cardLink}>Rehberi oku <ArrowUpRight size={16} aria-hidden="true" /></span></div>
  </Link>;
}
