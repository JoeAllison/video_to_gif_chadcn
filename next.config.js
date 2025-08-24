/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for GitHub Pages
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Fix for React 19 static export issues
  experimental: {
    optimizePackageImports: ['lucide-react']
  }
}

module.exports = nextConfig
