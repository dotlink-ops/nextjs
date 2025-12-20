// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Note: Next.js 16.0.0 does not recognize `experimental.turbo.root`.
    // This config is prepared for future Next.js versions that support it.
    // Turbopack is already working correctly without explicit root config
    // since there's only one package-lock.json at the project root.
    //
    // Uncomment when upgrading to a Next.js version that supports it:
    // turbo: {
    //   root: path.join(__dirname),
    // },
  },
};

export default nextConfig;
