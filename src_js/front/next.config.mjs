/** @type {import('next').NextConfig} */
const url = process.env.NEXT_PUBLIC_GO_API_URL;

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*', // 匹配以 /api 开头的所有请求
        destination: `http://${url}:8080/:path*`, // 动态代理到环境变量指定的后端服务器
      },
    ];
  },
};

export default nextConfig;
