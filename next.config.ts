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
  async redirects() {
    return [{ source: "/:path*", has: [{ type: "host", value: "www.frenaw.com" }], destination: "https://frenaw.com/:path*", permanent: true }];
  },
};

export default nextConfig;
