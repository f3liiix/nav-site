import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/utils/auth';
import {
  successResponse,
  unauthorizedResponse,
  errorResponse,
  serverErrorResponse,
} from '@/utils/api';

// 获取所有分类
export async function GET(request: NextRequest) {
  try {
    // 验证管理员身份
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return unauthorizedResponse();
    }

    // 获取所有分类，按sortOrder排序
    const categories = await prisma.category.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return successResponse(categories);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// 创建分类
export async function POST(request: NextRequest) {
  try {
    // 验证管理员身份
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return unauthorizedResponse();
    }

    // 解析请求数据
    const body = await request.json();
    const {
      name,
      slug,
      description,
      icon,
      sortOrder,
      seoTitle,
      seoDescription,
      seoKeywords,
    } = body;

    // 验证数据
    if (!name || typeof name !== 'string') {
      return errorResponse('分类名称不能为空');
    }

    if (!slug || typeof slug !== 'string') {
      return errorResponse('英文标识不能为空');
    }

    // 验证slug格式
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return errorResponse('英文标识只能包含小写字母、数字和连字符');
    }

    // 检查分类名称是否已存在
    const existingCategoryByName = await prisma.category.findUnique({
      where: { name },
    });

    if (existingCategoryByName) {
      return errorResponse('分类名称已存在');
    }

    // 检查slug是否已存在
    const existingCategoryBySlug = await prisma.category.findUnique({
      where: { slug } as { slug: string },
    });

    if (existingCategoryBySlug) {
      return errorResponse('英文标识已存在');
    }

    // 获取最大排序值
    const maxSortOrder = await prisma.category.findFirst({
      orderBy: {
        sortOrder: 'desc',
      },
      select: {
        sortOrder: true,
      },
    });

    const newSortOrder =
      sortOrder !== undefined ? sortOrder : (maxSortOrder?.sortOrder || 0) + 10;

    // 创建分类
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        icon: icon || null,
        sortOrder: newSortOrder,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        seoKeywords: seoKeywords || null,
      } as {
        name: string;
        slug: string;
        description: string | null;
        icon: string | null;
        sortOrder: number;
        seoTitle: string | null;
        seoDescription: string | null;
        seoKeywords: string | null;
      },
    });

    return successResponse(category, '创建分类成功');
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// 更新分类排序
export async function PUT(request: NextRequest) {
  try {
    // 验证管理员身份
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return unauthorizedResponse();
    }

    // 解析请求数据
    const body = await request.json();

    // 验证数据格式
    if (!Array.isArray(body)) {
      return errorResponse('请求数据格式错误，应为数组');
    }

    // 批量更新分类排序
    const updatePromises = body.map(item => {
      if (!item.id || typeof item.sortOrder !== 'number') {
        throw new Error('数据格式错误，每个项目必须包含id和sortOrder');
      }

      return prisma.category.update({
        where: { id: item.id },
        data: { sortOrder: Number(item.sortOrder) },
      });
    });

    await Promise.all(updatePromises);

    // 获取更新后的分类列表
    const afterCategories = await prisma.category.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return successResponse(afterCategories, '更新分类排序成功');
  } catch (error) {
    return serverErrorResponse(error);
  }
}
