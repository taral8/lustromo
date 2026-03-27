/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => [
    {
      // Service worker must be served from root with no-cache
      source: "/sw.js",
      headers: [
        { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        { key: "Service-Worker-Allowed", value: "/" },
      ],
    },
  ],
}

export default nextConfig
