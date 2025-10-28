import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer';
import { withNextVideo } from 'next-video/process';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    unoptimized: false,
    remotePatterns: [
      // Firebase Storage
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      // Cloudflare Stream - Your specific customer domain
      {
        protocol: 'https',
        hostname: 'customer-lffnf3fehpofp821.cloudflarestream.com',
      },
      // Optional: Allow any Cloudflare Stream customer domain (wildcard)
      // This is useful if you ever change your customer code
      {
        protocol: 'https',
        hostname: '*.cloudflarestream.com',
      },
    ],
    qualities: [90, 100],
  },
  webpack: (config, { isServer }) => {
    const externals = Array.isArray(config.externals) ? config.externals : [];
    config.externals = [...externals, { canvas: "canvas" }];
    return config;
  },
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: false,
};

// Apply next-video wrapper, then bundle analyzer
export default withBundleAnalyzer(withNextVideo(nextConfig));












// import type { NextConfig } from "next";
// import bundleAnalyzer from '@next/bundle-analyzer';

// const withBundleAnalyzer = bundleAnalyzer({
//   enabled: process.env.ANALYZE === 'true',
// });

// const nextConfig: NextConfig = {
//   images: {
//     minimumCacheTTL: 60,
//     dangerouslyAllowSVG: true,
//     unoptimized: false,
//     domains: ['firebasestorage.googleapis.com', 'storage.googleapis.com', 'customer-0aaded88ae2abee01251018ab6c5ab6f.cloudflarestream.com',],
//     qualities: [90, 100],
//   },
//   webpack: (config, { isServer }) => {
//     const externals = Array.isArray(config.externals) ? config.externals : [];
//     config.externals = [...externals, { canvas: "canvas" }];
//     return config;
//   },
//   eslint: { ignoreDuringBuilds: true },
//   reactStrictMode: false,
// };

// export default withBundleAnalyzer(nextConfig);










// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   images: {
//     minimumCacheTTL: 60,
//     dangerouslyAllowSVG: true,
//     unoptimized: false,
//     domains: ['firebasestorage.googleapis.com', 'storage.googleapis.com'],
//     qualities: [90, 100],
//   },
//   webpack: (config, { isServer }) => {
//     const externals = Array.isArray(config.externals) ? config.externals : [];
//     config.externals = [...externals, { canvas: "canvas" }];
//     return config;
//   },
//   eslint: { ignoreDuringBuilds: true },
//   reactStrictMode: false,
// };

// export default nextConfig;



