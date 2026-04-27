import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    // Cloudflare Workers / next-on-pages:
    // next-auth uses async_hooks internally. next-on-pages cannot polyfill it
    // as a local file, so we alias it to the native node:async_hooks built-in
    // which is available with the nodejs_compat compatibility flag.
    config.resolve.alias = {
      ...config.resolve.alias,
      "async_hooks": "node:async_hooks",
    };
    return config;
  },
};

export default nextConfig;
