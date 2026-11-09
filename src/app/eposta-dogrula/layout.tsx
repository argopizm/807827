import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "E-posta doğrulama",
  robots: { index: false, follow: false },
};

export default function EmailVerificationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
