import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev server blocks HMR when the page is opened as 127.0.0.1.
  allowedDevOrigins: ["127.0.0.1"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
