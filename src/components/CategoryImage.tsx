"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import styles from "./CategoryImage.module.css";

export default function CategoryImage({ slug, title, eager = false }: { slug: string; title: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={styles.visual}>
      <span className={styles.fallback} aria-hidden="true"><ImageIcon size={40} /><span>{title}</span></span>
      {!failed && (
        // Native local images avoid relying on an image-optimization service in the Worker.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/images/categories/${slug}-v2.webp`} alt="" width={720} height={480} loading={eager ? "eager" : "lazy"} decoding="async" onError={() => setFailed(true)} />
      )}
    </span>
  );
}
