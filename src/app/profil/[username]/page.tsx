export const runtime = "edge";

import { getDB, formatRelativeDate } from "@/lib/db";
import { notFound } from "next/navigation";
import ProfileClient, { type ProfileData, type ReviewItem } from "./ProfileClient";

async function getProfileAndReviews(username: string): Promise<{ profile: ProfileData; reviews: ReviewItem[] } | null> {
  try {
    const db = await getDB();
    if (!db) return null;

    const user = await db
      .prepare(
        `SELECT id, email, COALESCE(full_name, name) AS full_name, username, title, category, skills,
                COALESCE(avatar_url, image) AS avatar_url, bio,
                tc_verified, trust_badge, rating_avg, total_jobs_completed, user_type, contact_links
         FROM users
         WHERE LOWER(username) = LOWER(?) OR id = ?`
      )
      .bind(username, username)
      .first<{
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
        rating_avg: number;
        total_jobs_completed: number;
        user_type: string | null;
        contact_links: string | null;
      }>();

    if (!user) return null;

    let links: Record<string, string> = {};
    try {
      links = JSON.parse(user.contact_links ?? "{}");
    } catch {
      links = {};
    }

    let parsedSkills: string[] = [];
    try {
      parsedSkills = JSON.parse(user.skills ?? "[]");
    } catch {
      parsedSkills = [];
    }

    const { results: dbReviews } = await db
      .prepare(
        `SELECT r.id, r.rating, r.comment, r.created_at,
                COALESCE(u.full_name, u.name, u.username, 'Kullanıcı') AS reviewer_name,
                COALESCE(j.title, 'Proje Değerlendirmesi') AS project_title
         FROM reviews r
         LEFT JOIN users u ON r.reviewer_id = u.id
         LEFT JOIN handshakes h ON r.handshake_id = h.id
         LEFT JOIN jobs j ON h.job_id = j.id
         WHERE r.reviewee_id = ?
         ORDER BY r.created_at DESC`
      )
      .bind(user.id)
      .all<{
        id: string;
        rating: number;
        comment: string | null;
        created_at: string | null;
        reviewer_name: string;
        project_title: string;
      }>();

    const reviews: ReviewItem[] = (dbReviews ?? []).map((r) => ({
      author: r.reviewer_name,
      project: r.project_title,
      rating: Number(r.rating ?? 5),
      text: r.comment ?? "",
      date: formatRelativeDate(r.created_at),
    }));

    return {
      profile: {
        username: user.username ?? username,
        name: user.full_name ?? "Kullanıcı",
        title: user.title ?? undefined,
        category: user.category ?? undefined,
        bio: user.bio ?? "",
        avatar: user.avatar_url ?? "",
        tc_verified: !!user.tc_verified,
        trust_badge: !!user.trust_badge,
        rating: Number(user.rating_avg ?? 0),
        jobs_done: Number(user.total_jobs_completed ?? 0),
        user_type: user.user_type ?? "freelancer",
        skills: Array.isArray(parsedSkills) ? parsedSkills : [],
        links,
      },
      reviews,
    };
  } catch {
    return null;
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const data = await getProfileAndReviews(username);
  if (!data) notFound();
  return <ProfileClient profile={data.profile} reviews={data.reviews} />;
}
