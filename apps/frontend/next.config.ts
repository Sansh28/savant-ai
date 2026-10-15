import path from "path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backend = (process.env.SAVANT_API_ORIGIN || "http://127.0.0.1:8000").replace(/\/+$/, "");
    return [{ source: "/api/backend/:path*", destination: `${backend}/:path*` }];
  },
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
