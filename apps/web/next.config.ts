import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@snews/ui", "@snews/db", "@snews/ai"],
  experimental: {
    optimizePackageImports: ["@snews/ui"],
  },
};

export default nextConfig;
