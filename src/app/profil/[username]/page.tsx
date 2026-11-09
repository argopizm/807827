import { publicNameSql, validDiscord } from "@/lib/public-identity";
import { identityMatched } from "@/lib/identity-check";
import { auth } from "@/auth";
import { cache } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { parseSkills, publicHttpsUrl } from "@/lib/browse";
import { categoryTitle } from "@/lib/categories";
import { getDB, formatRelativeDate } from "@/lib/db";
import { jsonLd, publicMetadata, siteUrl, summarize } from "@/lib/seo";
import ProfileClient, { type ProfileData, type ReviewItem } from "./ProfileClient";


interface ProfileRow {
  id: string;
  name: string;
  username: string;
  title: string | null;
  category: string | null;
  skills: string | null;
  avatar: string | null;
  bio: string | null;
  rating_avg: number | null;
  total_jobs_completed: number | null;
  user_type: "freelancer" | "employer";
  contact_links: string | null;
  identity_matched: number;
}

function publicContactLinks(raw: string | null): ProfileData["links"] {
  try {
    const value = JSON.parse(raw ?? "{}");
    if (value?.public !== true) return {};
    return {
      whatsapp: typeof value.whatsapp === "string" && /^[1-9]\d{7,14}$/.test(value.whatsapp) ? value.whatsapp : undefined,
      discord: typeof value.discord === "string" && validDiscord(value.discord) ? value.discord : undefined,
      portfolio: publicHttpsUrl(value.portfolio) || undefined,
    };
  } catch {
    return {};
  }
}

const getPublicProfile = cache(async function (username: string): Promise<ProfileData | null> {
  const db = await getDB();
  if (!db) return null;

  const user = await db.prepare(
    "SELECT id, " + publicNameSql() + " AS name, username, title, category, skills, " +
    "COALESCE(avatar_url, image) AS avatar, bio, rating_avg, total_jobs_completed, user_type, contact_links, tc_verified = " + identityMatched + " AS identity_matched " +
    "FROM users WHERE (LOWER(username) = LOWER(?) OR id = ?) AND user_type IN ('freelancer', 'employer') " +
    "AND onboarding_done = 1 AND NULLIF(TRIM(username), '') IS NOT NULL"
  ).bind(username, username).first<ProfileRow>();
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    title: user.title ?? undefined,
    category: categoryTitle(user.category),
    bio: user.bio ?? "",
    avatar: publicHttpsUrl(user.avatar),
    rating: Number(user.rating_avg ?? 0),
    jobs_done: Number(user.total_jobs_completed ?? 0),
    user_type: user.user_type,
    skills: parseSkills(user.skills),
    links: publicContactLinks(user.contact_links),
    identityMatched: Boolean(user.identity_matched),
  };
});

async function getPublicReviews(userId: string): Promise<ReviewItem[]> {
  const db = await getDB();
  if (!db) return [];
  const { results } = await db.prepare(
    "SELECT r.id, r.rating, r.comment, r.created_at, " +
    "" + publicNameSql("u") + " AS reviewer_name, j.title AS project_title " +
    "FROM reviews r JOIN handshakes h ON h.id = r.handshake_id JOIN jobs j ON j.id = h.job_id " +
    "LEFT JOIN users u ON r.reviewer_id = u.id " +
    "WHERE r.reviewee_id = ? AND h.status = 'completed' AND j.status = 'completed' AND " +
    "((h.client_id = r.reviewer_id AND h.freelancer_id = r.reviewee_id) OR " +
    "(h.freelancer_id = r.reviewer_id AND h.client_id = r.reviewee_id)) " +
    "ORDER BY r.created_at DESC, r.id DESC LIMIT 25"
  ).bind(userId).all<{
    id: string;
    rating: number;
    comment: string | null;
    created_at: string | null;
    reviewer_name: string;
    project_title: string;
  }>();

  return results.map((review) => ({
    id: review.id,
    author: review.reviewer_name,
    project: review.project_title,
    rating: Number(review.rating),
    text: review.comment ?? "",
    date: formatRelativeDate(review.created_at),
  }));
}

function pathFor(username: string) {
  return "/profil/" + encodeURIComponent(username);
}

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props) {
  const profile = await getPublicProfile((await params).username);
  if (!profile) notFound();
  return publicMetadata({
    title: profile.name + (profile.title ? " · " + profile.title : " · Frenaw Profili"),
    description: summarize(profile.bio) || profile.name + " adlı kullanıcının Frenaw profili.",
    path: pathFor(profile.username),
    index: profile.user_type === "freelancer" && profile.bio.trim().length >= 40,
  });
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  if (!profile) notFound();
  if (profile.username !== username) permanentRedirect(pathFor(profile.username));
  const [reviews, session] = await Promise.all([getPublicReviews(profile.id), auth()]);
  const url = new URL(pathFor(profile.username), siteUrl).href;

  return (
    <>
      {profile.user_type === "freelancer" && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url,
          mainEntity: {
            "@type": "Person",
            name: profile.name,
            alternateName: profile.username,
            description: profile.bio || undefined,
            image: profile.avatar || undefined,
            url,
          },
        }) }} />
      )}
      <ProfileClient profile={profile} reviews={reviews} owner={session?.user?.id === profile.id} />
    </>
  );
}
