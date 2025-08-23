/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    
    // Make asset paths relative for static export
    if (!isServer) {
      config.output.publicPath = './';
    }
    
    return config;
  },
}

module.exports = nextConfig
