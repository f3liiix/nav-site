import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/utils/api';
import { RouteContext } from '../../../admin/categories/[id]/route';

// 增加服务点击次数
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    // 解析Promise获取参数
    const resolvedParams = await context.params;
    const id = parseInt(resolvedParams.id, 10);

    if (isNaN(id)) {
      return errorResponse('无效的服务ID');
    }

    // 查找服务
    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      return errorResponse('服务不存在', 404);
    }

    // 更新点击次数
    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        clickCount: {
          increment: 1,
        },
      },
    });

    return successResponse({ clickCount: updatedService.clickCount });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
