import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath: "/FLUENT-AI",
  assetPrefix: "/FLUENT-AI/",
};

export default nextConfig;