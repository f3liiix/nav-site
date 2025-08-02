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
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';

// 定义路由参数类型
export interface RouteContext {
  params: Promise<{ id: string }>;
}

// 获取单个分类
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // 验证管理员身份
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return unauthorizedResponse();
    }

    // 解析Promise获取参数
    const resolvedParams = await context.params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return errorResponse('无效的分类ID');
    }

    // 获取分类
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return notFoundResponse('分类不存在');
    }

    return successResponse(category);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// 更新分类
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    // 验证管理员身份
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return unauthorizedResponse();
    }

    // 解析Promise获取参数
    const resolvedParams = await context.params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return errorResponse('无效的分类ID');
    }

    // 检查分类是否存在
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return notFoundResponse('分类不存在');
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

    // 检查分类名称是否已被其他分类使用
    const existingCategoryByName = await prisma.category.findUnique({
      where: { name },
    });

    if (existingCategoryByName && existingCategoryByName.id !== id) {
      return errorResponse('分类名称已存在');
    }

    // 检查slug是否已被其他分类使用
    const existingCategoryBySlug = await prisma.category.findUnique({
      where: { slug } as { slug: string },
    });

    if (existingCategoryBySlug && existingCategoryBySlug.id !== id) {
      return errorResponse('英文标识已存在');
    }

    // 更新分类
    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
        icon: icon || null,
        sortOrder:
          typeof sortOrder === 'number'
            ? sortOrder
            : sortOrder
              ? Number(sortOrder)
              : existingCategory.sortOrder,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        seoKeywords: seoKeywords || null,
      },
    });

    return successResponse(category, '更新分类成功');
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// 删除分类
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    // 验证管理员身份
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return unauthorizedResponse();
    }

    // 解析Promise获取参数
    const resolvedParams = await context.params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return errorResponse('无效的分类ID');
    }

    // 检查分类是否存在
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return notFoundResponse('分类不存在');
    }

    // 删除分类图标文件（如果存在）
    if (existingCategory.icon) {
      try {
        // 从URL中提取文件路径
        const iconPath = existingCategory.icon.replace(/^\/uploads\//, '');
        const filePath = join(process.cwd(), 'public', 'uploads', iconPath);

        // 检查文件是否存在
        if (existsSync(filePath)) {
          // 删除文件
          unlinkSync(filePath);
          console.log(`已删除分类图标文件: ${filePath}`);
        }
      } catch (fileError) {
        // 文件删除失败不影响数据库操作，只记录日志
        console.error('删除分类图标文件失败:', fileError);
      }
    }

    // 删除分类
    await prisma.category.delete({
      where: { id },
    });

    return successResponse(null, '删除分类成功');
  } catch (error) {
    return serverErrorResponse(error);
  }
}
