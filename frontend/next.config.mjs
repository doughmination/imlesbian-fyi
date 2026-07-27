/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output = a self-contained Node server, ideal for sitting
  // behind an existing nginx reverse proxy (no Vercel/edge assumptions).
  output: "standalone",
  reactStrictMode: true,
};

export default nextConfig;
