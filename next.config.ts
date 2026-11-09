import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

if (process.env.NODE_ENV === "development") {
  const state = process.env.FRENAW_LOCAL_D1_STATE;
  void initOpenNextCloudflareForDev({
    remoteBindings: false,
    ...(state ? { persist: { path: state }, envFiles: [] } : {}),
  }).catch(() => console.error("Yerel Cloudflare bağlayıcıları başlatılamadı."));
}

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        // Framing protection only; a full script CSP needs nonces for Next's inline scripts.
        { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        { key: "Strict-Transport-Security", value: "max-age=31536000" },
      ],
    }];
  },
  async redirects() {
    return [{ source: "/:path*", has: [{ type: "host", value: "www.frenaw.com" }], destination: "https://frenaw.com/:path*", permanent: true }];
  },
};

export default nextConfig;
