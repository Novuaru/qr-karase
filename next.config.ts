/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sdwdilvlfhnqrlxmuvje.supabase.co',
        pathname: '/storage/v1/object/public/restaurant-logos/**',
      },
    ],
  },
};

module.exports = nextConfig;
