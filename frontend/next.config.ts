import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
  output: "standalone",
  allowedDevOrigins: ["192.168.0.100"],
  async rewrites() {
    const backendUrl = process.env.INTERNAL_API_URL
      ? process.env.INTERNAL_API_URL.replace(/\/api$/, "")
      : "http://backend:5000";

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
