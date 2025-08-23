/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export config - using GitHub Actions instead
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
