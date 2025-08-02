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

// 获取服务的标签
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
      return errorResponse('无效的服务ID');
    }

    // 检查服务是否存在
    const service = await prisma.service.findUnique({
      where: {
        id,
      },
    });

    if (!service) {
      return notFoundResponse('服务不存在');
    }

    // 获取服务关联的标签
    const serviceTags = await prisma.serviceTag.findMany({
      where: {
        serviceId: id,
      },
      include: {
        tag: true,
      },
    });

    // 提取标签信息
    const tags = serviceTags.map(st => st.tag);

    return successResponse(tags);
  } catch (error) {
    console.error('获取服务标签失败:', error);
    return serverErrorResponse('获取服务标签失败');
  }
}

// 更新服务的标签
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
      return errorResponse('无效的服务ID');
    }

    // 解析请求体
    const body = await request.json();
    const { tagIds } = body;

    if (!Array.isArray(tagIds)) {
      return errorResponse('标签ID列表格式不正确');
    }

    // 检查服务是否存在
    const service = await prisma.service.findUnique({
      where: {
        id,
      },
    });

    if (!service) {
      return notFoundResponse('服务不存在');
    }

    // 删除现有的标签关联
    await prisma.serviceTag.deleteMany({
      where: {
        serviceId: id,
      },
    });

    // 创建新的标签关联
    if (tagIds.length > 0) {
      const tagConnections = tagIds.map(tagId => ({
        serviceId: id,
        tagId: parseInt(tagId),
      }));

      await prisma.serviceTag.createMany({
        data: tagConnections,
      });
    }

    // 获取更新后的服务
    const updatedService = await prisma.service.findUnique({
      where: {
        id,
      },
    });

    // 获取更新后的标签
    const updatedServiceTags = await prisma.serviceTag.findMany({
      where: {
        serviceId: id,
      },
      include: {
        tag: true,
      },
    });

    // 构建响应数据
    const responseData = {
      ...updatedService,
      tags: updatedServiceTags.map(st => st.tag),
    };

    return successResponse(responseData);
  } catch (error) {
    console.error('更新服务标签失败:', error);
    return serverErrorResponse('更新服务标签失败');
  }
}
