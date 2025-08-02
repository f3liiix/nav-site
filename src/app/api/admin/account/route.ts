import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin, getAdminIdFromRequest } from '@/utils/auth';
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/utils/api';

// 获取当前管理员信息
export async function GET(request: NextRequest) {
  try {
    // 验证管理员身份
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return unauthorizedResponse();
    }

    // 获取管理员ID
    const adminId = getAdminIdFromRequest(request);
    if (!adminId) {
      return unauthorizedResponse('无法获取管理员信息');
    }

    // 查询管理员信息
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      return unauthorizedResponse('管理员不存在');
    }

    return successResponse(admin);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
