import { auth } from "@/auth";
import Link from "next/link";
import ProfileEditor from "./ProfileEditor";

export default async function EditProfilePage() {
  const session = await auth();
  if (!session?.user?.id) return <section className="container" style={{paddingTop:70,paddingBottom:90}}><h1>Profilini düzenle</h1><p style={{margin:"20px 0"}}>Profil bilgilerini düzenlemek için hesabına giriş yap.</p><Link className="btn-primary" href="/giris?callbackUrl=%2Fhesabim%2Fprofil">Giriş yap</Link></section>;
  return <ProfileEditor />;
}
