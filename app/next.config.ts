import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/privacy-policy",
        destination: "https://www.shonan-ipark.com/privacy-policy/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
