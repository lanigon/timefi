/** @type {import('next').NextConfig} */
const url = process.env.NEXT_PUBLIC_GO_API_URL;
const aiurl = process.env.NEXT_PUBLIC_PY_API_URL;

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `http://${url}:8080/:path*`,
      },
      {
        source: '/ai/:path*',
        destination: `http://${aiurl}:3008/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
