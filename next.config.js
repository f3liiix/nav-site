/** @type {import('next').NextConfig} */
const config = {
  output: 'standalone',
  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // 添加构建ID，确保每次构建生成不同的资源URL
  generateBuildId: async () => {
    // 使用时间戳或环境变量作为构建ID
    return process.env.BUILD_ID || Date.now().toString();
  },
  // 添加HTTP头，控制缓存
  async headers() {
    return [
      {
        // 对所有路由应用这些头，防止浏览器和CDN缓存
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
};

export default config;
