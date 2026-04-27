"use client";

import { useEffect } from "react";

interface AdSenseSlotProps {
  id: string;
  format?: "auto" | "fluid" | "rectangle";
  className?: string;
}

export default function AdSenseSlot({ id, format = "auto", className = "" }: AdSenseSlotProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  return (
    <div className={`adsense-container ${className}`} style={{ overflow: "hidden", minHeight: "100px" }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-YOUR_CLIENT_ID" // Kullanıcı kendi ID'sini eklemeli
        data-ad-slot={id}
        data-ad-format={format}
        data-full-width-responsive="true"
      ></ins>
      <div className="ads-label">İLAN / REKLAM</div>

      <style jsx>{`
        .adsense-container {
          position: relative;
          background: rgba(255, 255, 255, 0.02);
          border: 1px dashed var(--glass-border);
          border-radius: 12px;
          margin: 20px 0;
          padding-top: 20px;
        }
        .ads-label {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
          color: var(--text-muted);
          background: var(--background);
          padding: 2px 8px;
          border-radius: 0 0 6px 6px;
          letter-spacing: 1px;
        }
      `}</style>
    </div>
  );
}
