import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker uses Next.js standalone output so the production image only ships
  // the minimal server files needed at runtime instead of the full source tree.
  output: "standalone",
};

export default nextConfig;
