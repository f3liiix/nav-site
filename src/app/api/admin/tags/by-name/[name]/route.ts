import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/utils/auth';
import {
  successResponse,
  unauthorizedResponse,
  errorResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/utils/api';

// 根据名称获取标签
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    // 验证管理员身份
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return unauthorizedResponse();
    }

    // 确保params是已解析的
    const { name } = await params;
    if (!name) {
      return errorResponse('标签名称不能为空');
    }

    // 查询标签
    const tag = await prisma.tag.findUnique({
      where: {
        name: decodeURIComponent(name),
      },
    });

    if (!tag) {
      return notFoundResponse('标签不存在');
    }

    return successResponse(tag);
  } catch (error) {
    console.error('获取标签失败:', error);
    return serverErrorResponse('获取标签失败');
  }
}
