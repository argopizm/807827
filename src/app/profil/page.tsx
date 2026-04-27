export const runtime = "edge";

import { getRequestContext } from "@cloudflare/next-on-pages";
import FreelancerListClient from "./FreelancerListClient";

interface DBUser {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  tc_verified: number;
  trust_badge: number;
  total_jobs_completed: number;
  rating_avg: number;
}

const MOCK_FREELANCERS = [
  { id: "1", username: "ali_yazilim", full_name: "Ali Yılmaz", email: "", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ali", bio: "Senior Full Stack Developer | React, Node.js, PostgreSQL uzmanı. 8 yıllık deneyim.", tc_verified: 1, trust_badge: 1, total_jobs_completed: 42, rating_avg: 4.9, skills: ["React", "Node.js", "TypeScript"], category: "Yazılım" },
  { id: "2", username: "ayse_tasarim", full_name: "Ayşe Kaya", email: "", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ayse", bio: "UI/UX Tasarımcı | Figma, Webflow ve mobil uygulama tasarımı konusunda uzmanım.", tc_verified: 1, trust_badge: 0, total_jobs_completed: 28, rating_avg: 4.8, skills: ["Figma", "UI/UX", "Webflow"], category: "Tasarım" },
  { id: "3", username: "mehmet_seo", full_name: "Mehmet Demir", email: "", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mehmet", bio: "SEO & Dijital Pazarlama uzmanı. 5 yılda 200+ başarılı proje.", tc_verified: 0, trust_badge: 1, total_jobs_completed: 67, rating_avg: 4.7, skills: ["SEO", "Google Ads", "Analytics"], category: "Pazarlama" },
  { id: "4", username: "zeynep_cevirmen", full_name: "Zeynep Arslan", email: "", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zeynep", bio: "İngilizce-Türkçe teknik çevirmen. Hukuk ve tıp alanlarında uzmanlaşmış.", tc_verified: 1, trust_badge: 1, total_jobs_completed: 135, rating_avg: 5.0, skills: ["Çeviri", "İngilizce", "Hukuk"], category: "Çeviri" },
  { id: "5", username: "can_video", full_name: "Can Öztürk", email: "", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Can", bio: "Video prodüksiyon ve motion grafik uzmanı. Adobe Premiere, After Effects.", tc_verified: 0, trust_badge: 0, total_jobs_completed: 19, rating_avg: 4.6, skills: ["Premiere Pro", "After Effects", "Motion"], category: "Video" },
  { id: "6", username: "selin_mobil", full_name: "Selin Çelik", email: "", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Selin", bio: "Flutter & React Native mobil uygulama geliştirici. App Store ve Play Store deneyimi.", tc_verified: 1, trust_badge: 0, total_jobs_completed: 31, rating_avg: 4.8, skills: ["Flutter", "React Native", "Dart"], category: "Yazılım" },
];

async function getFreelancers() {
  try {
    const { env } = getRequestContext();
    const db = (env as Record<string, unknown>).DB as D1Database | undefined;
    if (!db) return null;
    const { results } = await db.prepare(
      "SELECT id, email, full_name, username, avatar_url, bio, tc_verified, trust_badge, total_jobs_completed, rating_avg FROM users ORDER BY rating_avg DESC LIMIT 50"
    ).all<DBUser>();
    return results ?? null;
  } catch {
    return null;
  }
}

export default async function FreelancerBulPage() {
  const dbFreelancers = await getFreelancers();
  const freelancers = dbFreelancers?.length
    ? dbFreelancers.map(u => ({
        id: u.id,
        username: u.username ?? u.email.split("@")[0],
        full_name: u.full_name ?? "İsimsiz Freelancer",
        email: u.email,
        avatar_url: u.avatar_url ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`,
        bio: u.bio ?? "",
        tc_verified: u.tc_verified,
        trust_badge: u.trust_badge,
        total_jobs_completed: u.total_jobs_completed,
        rating_avg: u.rating_avg,
        skills: [] as string[],
        category: "Genel",
      }))
    : MOCK_FREELANCERS;

  return <FreelancerListClient freelancers={freelancers} />;
}
