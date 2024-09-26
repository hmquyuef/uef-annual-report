/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
      domains: ['api-annual.uef.edu.vn', 'portal.uef.edu.vn'],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'api-annual.uef.edu.vn',
          pathname: '/files/',
        },
      ],
    },
    // images: {
    //     remotePatterns: [
    //       {
    //         protocol: 'http',
    //         hostname: '192.168.98.60',
    //         pathname: '/files/',
    //         port: '8081',
    //       },
    //     ],
    //   },
};

export default nextConfig;
