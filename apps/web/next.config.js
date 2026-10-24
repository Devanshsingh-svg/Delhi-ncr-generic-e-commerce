/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  // Page-data collection runs over the slow /mnt/c (WSL 9p) filesystem and
  // can exceed the 60s default, which SIGTERMs build workers mid-build.
  staticPageGenerationTimeout: 600,
  // transpilePackages: ['@gq/contracts', '@gq/domain', '@gq/config', '@gq/observability'],
  async rewrites() {
    return [{ source: '/api/:path*', destination: 'http://localhost:4000/api/v1/:path*' }];
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
};

module.exports = nextConfig;