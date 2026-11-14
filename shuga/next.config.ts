import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "lh3.googleusercontent.com" },
      { hostname: "platform-lookaside.fbsbx.com" },
    ],
  },
};

export default nextConfig;
