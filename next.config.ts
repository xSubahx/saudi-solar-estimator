// @ts-check
// NOTE: Wrangler handles dev-platform setup during local development via
// `npx wrangler pages dev`. Build uses `@opennextjs/cloudflare`.
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // ESLint is run separately in CI; don't block production builds on lint warnings
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
