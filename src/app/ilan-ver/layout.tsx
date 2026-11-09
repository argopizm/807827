import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Proje İlanı Ver", robots: { index: false, follow: false } };

export default function PostJobLayout({ children }: { children: ReactNode }) {
  return children;
}
