import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
  output: "standalone",
  allowedDevOrigins: ["192.168.0.100"],
};

export default nextConfig;
