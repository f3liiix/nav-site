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
import { redisHelper } from '@/lib/redis';

// 获取单个标签
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证管理员身份
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return unauthorizedResponse();
    }

    // 确保params是已解析的
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return errorResponse('无效的标签ID');
    }

    // 查询标签
    const tag = await prisma.tag.findUnique({
      where: {
        id,
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

// 更新标签
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证管理员身份
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return unauthorizedResponse();
    }

    // 确保params是已解析的
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return errorResponse('无效的标签ID');
    }

    // 解析请求体
    const body = await request.json();
    const { name } = body;

    // 验证请求数据
    if (!name || typeof name !== 'string') {
      return errorResponse('标签名称不能为空');
    }

    // 检查标签是否存在
    const existingTag = await prisma.tag.findUnique({
      where: {
        id,
      },
    });

    if (!existingTag) {
      return notFoundResponse('标签不存在');
    }

    // 检查名称是否已被其他标签使用
    const nameExists = await prisma.tag.findFirst({
      where: {
        name,
        id: {
          not: id,
        },
      },
    });

    if (nameExists) {
      return errorResponse('标签名称已存在');
    }

    // 更新标签
    const updatedTag = await prisma.tag.update({
      where: {
        id,
      },
      data: {
        name,
        updatedAt: new Date(),
      },
    });

    // 清除标签列表缓存
    const keys = await redisHelper.keys('admin:tags:*');
    if (keys.length > 0) {
      await redisHelper.del(...keys);
    }

    return successResponse(updatedTag);
  } catch (error) {
    console.error('更新标签失败:', error);
    return serverErrorResponse('更新标签失败');
  }
}

// 删除标签
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证管理员身份
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return unauthorizedResponse();
    }

    // 确保params是已解析的
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return errorResponse('无效的标签ID');
    }

    // 检查标签是否存在
    const existingTag = await prisma.tag.findUnique({
      where: {
        id,
      },
    });

    if (!existingTag) {
      return notFoundResponse('标签不存在');
    }

    // 删除标签
    try {
      // 先删除标签与服务的关联关系
      await prisma.serviceTag.deleteMany({
        where: {
          tagId: id,
        },
      });

      // 删除标签
      await prisma.tag.delete({
        where: {
          id,
        },
      });

      // 清除标签列表缓存
      const keys = await redisHelper.keys('admin:tags:*');
      if (keys.length > 0) {
        await redisHelper.del(...keys);
      }

      return successResponse({ message: '标签删除成功' });
    } catch (error) {
      console.error('删除标签失败:', error);
      return serverErrorResponse('删除标签失败');
    }
  } catch (error) {
    console.error('删除标签失败:', error);
    return serverErrorResponse('删除标签失败');
  }
}
