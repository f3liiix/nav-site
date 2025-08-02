import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/utils/auth';
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/utils/api';

// 网站类型（包含分类名称）
type ServiceWithCategory = {
  id: number;
  name: string;
  url: string;
  description: string;
  icon: string | null;
  clickCount: number;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
  category: {
    name: string;
  };
};

// 获取热门网站
export async function GET(request: NextRequest) {
  try {
    // 验证管理员身份
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return unauthorizedResponse();
    }

    // 获取点击量最高的10个网站
    const popularServices = await prisma.service.findMany({
      take: 10,
      orderBy: {
        clickCount: 'desc',
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    // 格式化数据
    const formattedServices = popularServices.map(
      (service: ServiceWithCategory) => ({
        id: service.id,
        name: service.name,
        url: service.url,
        icon: service.icon,
        clickCount: service.clickCount,
        categoryName: service.category.name,
      })
    );

    // 返回热门网站
    return successResponse(formattedServices);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
