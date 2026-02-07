/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  transpilePackages: ["@shoreline/shared"],
  images: {
    unoptimized: true
  }
};

export default nextConfig;
