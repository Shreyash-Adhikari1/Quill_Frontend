import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker uses Next.js standalone output so the production image only ships
  // the minimal server files needed at runtime instead of the full source tree.
  output: "standalone",
  async headers() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:5000/api";
    const apiOrigin = new URL(apiUrl).origin;
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      `connect-src 'self' ${apiOrigin} https://www.google.com https://www.gstatic.com`,
      "frame-src https://www.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: csp,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
