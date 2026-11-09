import type { Metadata } from "next";

export const metadata: Metadata = { title: "Hesap türü", robots: { index: false, follow: false } };

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
