const nextConfig = { 
  reactStrictMode: false, 
  eslint: { ignoreDuringBuilds: true }, 
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/7.x/**',
      },
    ],
  },
}; 
module.exports = nextConfig;
