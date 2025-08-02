import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, serverErrorResponse } from '@/utils/api';
import { SearchResult } from '@/types/api';
import { redisHelper } from '@/lib/redis';

// 缓存时间（秒）
const CACHE_TTL = 60; // 1分钟

// 实时搜索API
export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    // 如果没有查询参数，返回空数组
    if (!query || query.trim() === '') {
      return successResponse([]);
    }

    const trimmedQuery = query.trim();

    // 构建缓存键
    const cacheKey = `live-search:${trimmedQuery}`;

    // 尝试从缓存获取结果
    const cachedResult = await redisHelper.get<SearchResult[]>(cacheKey);
    if (cachedResult) {
      return successResponse(cachedResult);
    }

    // 使用MySQL的LIKE查询搜索服务
    const services = await prisma.service.findMany({
      where: {
        OR: [
          { name: { contains: trimmedQuery } },
          { description: { contains: trimmedQuery } },
        ],
      },
      select: {
        id: true,
        name: true,
        url: true,
        description: true,
        icon: true,
        clickCount: true,
        categoryId: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        clickCount: 'desc',
      },
      take: 8, // 只返回前8个服务结果
    });

    // 搜索匹配的标签
    const tags = await prisma.tag.findMany({
      where: {
        name: {
          contains: trimmedQuery,
        },
      },
      select: {
        id: true,
        name: true,
      },
      take: 3, // 只返回前3个标签结果
    });

    // 格式化服务结果
    const formattedServices: SearchResult[] = services.map(service => ({
      id: service.id,
      name: service.name,
      url: service.url,
      description: service.description,
      icon: service.icon,
      clickCount: service.clickCount,
      categoryId: service.categoryId,
      categoryName: service.category.name,
      categorySlug: service.category.slug,
      isTag: false,
    }));

    // 格式化标签结果
    const formattedTags: SearchResult[] = tags.map(tag => ({
      id: -tag.id, // 使用负数ID避免与服务ID冲突
      name: tag.name,
      url: `/tag/${encodeURIComponent(tag.name)}`,
      description: `查看与"${tag.name}"相关的所有网站`,
      icon: null,
      clickCount: 0,
      categoryId: 0,
      categoryName: '标签',
      categorySlug: 'tag',
      isTag: true,
      tagId: tag.id,
    }));

    // 合并结果，标签放在前面
    const combinedResults = [...formattedTags, ...formattedServices];

    // 缓存结果
    await redisHelper.set(cacheKey, combinedResults, {
      ex: CACHE_TTL,
    });

    return successResponse(combinedResults);
  } catch (error) {
    console.error('实时搜索失败:', error);
    return serverErrorResponse(error);
  }
}
