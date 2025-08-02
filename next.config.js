/** @type {import('next').NextConfig} */
const nextConfig = {
  // 为Docker部署添加standalone输出模式
  output: 'standalone',

  images: {
    domains: ['localhost'],
    unoptimized: true, // 禁用图片优化以避免在standalone模式下的问题
  },

  // 环境变量配置
  env: {
    APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '',
  },
};

export default nextConfig;
