export const runtime = "edge";

import { getDB } from "@/lib/db";
import FreelancerListClient from "./FreelancerListClient";

interface DBUser {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  title: string | null;
  category: string | null;
  skills: string | null;
  avatar_url: string | null;
  bio: string | null;
  tc_verified: number;
  trust_badge: number;
  total_jobs_completed: number;
  rating_avg: number;
}

async function getFreelancers() {
  try {
    const db = await getDB();
    if (!db) return [];
    const { results } = await db
      .prepare(
        `SELECT id, email, COALESCE(full_name, name) AS full_name, username, title, category, skills,
                COALESCE(avatar_url, image) AS avatar_url, bio,
                tc_verified, trust_badge, total_jobs_completed, rating_avg
         FROM users
         WHERE user_type = 'freelancer' OR user_type IS NULL
         ORDER BY rating_avg DESC, total_jobs_completed DESC
         LIMIT 100`
      )
      .all<DBUser>();
    return results ?? [];
  } catch {
    return [];
  }
}

export default async function FreelancerBulPage() {
  const dbFreelancers = await getFreelancers();
  const freelancers = dbFreelancers.map((u) => {
    let parsedSkills: string[] = [];
    try {
      parsedSkills = JSON.parse(u.skills ?? "[]");
    } catch {
      parsedSkills = [];
    }
    return {
      id: u.id,
      username: u.username ?? u.email.split("@")[0],
      full_name: u.full_name ?? "Kullanıcı",
      title: u.title ?? undefined,
      email: u.email,
      avatar_url: u.avatar_url ?? "",
      bio: u.bio ?? "",
      tc_verified: u.tc_verified ?? 0,
      trust_badge: u.trust_badge ?? 0,
      total_jobs_completed: u.total_jobs_completed ?? 0,
      rating_avg: u.rating_avg ?? 0,
      skills: Array.isArray(parsedSkills) ? parsedSkills : [],
      category: u.category || "Genel",
    };
  });

  return <FreelancerListClient freelancers={freelancers} />;
}
