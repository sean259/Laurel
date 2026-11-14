import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {};

export default nextConfig;

// Lets `next dev` access Cloudflare bindings (KV, R2, …) if we add any later.
initOpenNextCloudflareForDev();
