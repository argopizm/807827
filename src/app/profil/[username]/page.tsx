export const runtime = "edge";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { notFound } from "next/navigation";
import ProfileClient from "./ProfileClient";

const MOCK_PROFILE = {
  username: "ali_yazilim",
  name: "Ali Yılmaz",
  bio: "Senior Full Stack Developer | React, Node.js, TypeScript uzmanı. 8+ yıl deneyim ile 40+ başarılı proje teslim ettim. Hızlı, temiz ve ölçeklenebilir kod yazarım.",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ali",
  tc_verified: true,
  trust_badge: true,
  rating: 4.9,
  jobs_done: 42,
  user_type: "freelancer",
  skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Next.js"],
  links: { whatsapp: "905000000000", discord: "ali#1234", portfolio: "https://ali.dev" },
};

async function getProfile(username: string) {
  try {
    const { env } = getRequestContext();
    const db = (env as Record<string, unknown>).DB as D1Database | undefined;
    if (!db) return null;

    const user = await db.prepare(
      "SELECT id, email, full_name, username, avatar_url, bio, tc_verified, trust_badge, rating_avg, total_jobs_completed, user_type, contact_links FROM users WHERE username = ?"
    ).bind(username).first<{
      id: string; email: string; full_name: string | null; username: string | null;
      avatar_url: string | null; bio: string | null; tc_verified: number; trust_badge: number;
      rating_avg: number; total_jobs_completed: number; user_type: string | null; contact_links: string | null;
    }>();

    if (!user) return null;

    let links: Record<string, string> = {};
    try { links = JSON.parse(user.contact_links ?? "{}"); } catch { links = {}; }

    return {
      username: user.username ?? username,
      name: user.full_name ?? "İsimsiz Kullanıcı",
      bio: user.bio ?? "",
      avatar: user.avatar_url ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
      tc_verified: !!user.tc_verified,
      trust_badge: !!user.trust_badge,
      rating: user.rating_avg ?? 0,
      jobs_done: user.total_jobs_completed ?? 0,
      user_type: user.user_type ?? "freelancer",
      skills: [] as string[],
      links,
    };
  } catch {
    return null;
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = await getProfile(username) ?? (username === MOCK_PROFILE.username ? MOCK_PROFILE : null);
  if (!profile) notFound();
  return <ProfileClient profile={profile} />;
}
