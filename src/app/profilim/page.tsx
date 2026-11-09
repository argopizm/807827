import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDB } from "@/lib/db";

export const metadata: Metadata = { title: "Profilim", robots: { index:false, follow:false } };
export default async function MyProfilePage() {
  const session=await auth();
  if(!session?.user?.id)redirect("/giris?callbackUrl=%2Fprofilim");
  const db=await getDB();
  const user=await db?.prepare("SELECT username,onboarding_done FROM users WHERE id=? AND deleted_at IS NULL").bind(session.user.id).first<{username:string|null;onboarding_done:number}>();
  if(!user)return <div className="container" style={{paddingTop:60,paddingBottom:80}}><h1>Profilin şu anda yüklenemedi.</h1><p style={{marginTop:18}}>Lütfen sayfayı biraz sonra yeniden aç.</p></div>;
  if(!user.onboarding_done)redirect("/onboarding?callbackUrl=%2Fprofilim");
  if(!user.username)redirect("/hesabim/profil");
  redirect("/profil/"+encodeURIComponent(user.username));
}
