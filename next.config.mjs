/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required so Mastra's packages are loaded by Node instead of being bundled by Next.js
  serverExternalPackages: ['@mastra/*'],
};

export default nextConfig;
