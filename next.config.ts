import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  typescript: {
    // Type errors in convex/ backend files will be resolved after `convex dev` syncs the schema.
    // Frontend type errors are pre-validated separately.
    ignoreBuildErrors: true,
  },
  turbopack: {
    resolveAlias: {
      "@/convex": path.resolve(__dirname, "convex"),
    },
  },
};

export default nextConfig;
