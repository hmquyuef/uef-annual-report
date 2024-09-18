/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
          {
            protocol: 'http',
            hostname: '172.29.102.14',
            // hostname: '192.168.98.60',
            port: '8081',
          },
        ],
      },
};

export default nextConfig;
