import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

// 初始化数据库
export const initializeSystem = async () => {
  try {
    // 初始化数据库
    const prisma = new PrismaClient();

    // 检查是否有管理员账户，如果没有则创建默认管理员
    const adminCount = await prisma.admin.count();
    if (adminCount === 0) {
      const hashedPassword = await hash('admin123', 10);
      await prisma.admin.create({
        data: {
          username: 'admin',
          password: hashedPassword,
        },
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('已创建默认管理员账户: admin / admin123');
      }
    }

    // 检查是否有分类，如果没有则创建默认分类
    const categoryCount = await prisma.category.count();
    if (categoryCount === 0) {
      await prisma.category.createMany({
        data: [
          { name: '聊天机器人', slug: 'chatbots' },
          { name: '图像生成', slug: 'image-generation' },
          { name: '文本处理', slug: 'text-processing' },
          { name: '音频处理', slug: 'audio-processing' },
          { name: '视频处理', slug: 'video-processing' },
          { name: '开发工具', slug: 'dev-tools' },
          { name: '其他工具', slug: 'other-tools' },
        ],
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('已创建默认分类');
      }
    }

    // 检查是否有系统设置，如果没有则创建默认设置
    const settingCount = await prisma.setting.count();
    if (settingCount === 0) {
      await prisma.setting.createMany({
        data: [
          { key: 'siteName', value: '123.SS' },
          { key: 'siteDescription', value: '收录优质AI服务和应用的导航网站' },
        ],
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('已创建默认系统设置');
      }
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('系统初始化失败:', error);
  }
};
