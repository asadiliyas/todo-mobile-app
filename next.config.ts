import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't auto-generate AGENTS.md/CLAUDE.md into this repo.
  agentRules: false,
};

export default nextConfig;
