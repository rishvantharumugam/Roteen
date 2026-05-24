import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    position: "bottom-right",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.image2url.com",
      },
      {
        protocol: "https",
        hostname: "image2url.com",
      },
    ],
  },
};

export default nextConfig;
