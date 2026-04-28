import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove standalone output — Vercel manages its own output format.
  // "standalone" conflicts with Vercel's deployment expectations.
};

export default nextConfig;
