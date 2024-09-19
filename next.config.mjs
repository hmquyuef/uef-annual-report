/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
      domains: ['api-annual.uef.edu.vn'],
    },
    // images: {
    //     remotePatterns: [
    //       {
    //         protocol: 'http',
    //         hostname: '192.168.98.60',
    //         port: '8081',
    //       },
    //     ],
    //     // remotePatterns: [
    //     //   {
    //     //     protocol: 'https',
    //     //     hostname: 'api-annual.uef.edu.vn',
    //     //   },
    //     // ],
    //   },
};

export default nextConfig;
