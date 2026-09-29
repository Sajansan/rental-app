import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? [{
          protocol: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).protocol.replace(":", "") as "http" | "https",
          hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
          pathname: "/storage/v1/object/public/vehicle-images/**",
        }]
      : [],
  },
};

export default nextConfig;
