import { prisma } from '@/lib/prisma';
import CategorySection from '@/components/CategorySection';
import ServiceCard from '@/components/ServiceCard';
import { Category, ServiceWithCategory, Tag } from '@/types';
import SmoothScrollScript from '@/components/SmoothScrollScript';
import BackToTopButton from '@/components/BackToTopButton';
import CategoryNavStyles from '@/components/CategoryNavStyles';
import CategoryIcon from '@/components/CategoryIcon';
import { Prisma } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';

// 设置页面不缓存，每次请求都重新渲染
export const revalidate = 0;

// 获取所有分类及其网站
async function getCategoriesWithServices(): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    include: {
      services: {
        take: 12,
        orderBy: {
          clickCount: 'desc',
        },
      },
    },
    orderBy: {
      sortOrder: 'asc',
    } as Prisma.CategoryOrderByWithRelationInput,
  });

  return categories as unknown as Category[];
}

// 获取热门网站
async function getPopularServices(): Promise<ServiceWithCategory[]> {
  const popularServices = await prisma.service.findMany({
    take: 12,
    orderBy: {
      clickCount: 'desc',
    },
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        } as { name: boolean; slug: boolean },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  // 格式化结果，添加标签信息
  return popularServices.map(service => ({
    ...service,
    categoryName: service.category.name,
    categorySlug: service.category.slug,
    tags: service.tags.map(st => st.tag),
  }));
}

// 获取热门标签
async function getPopularTagsByCategory(): Promise<Record<number, Tag[]>> {
  // 获取所有服务标签关联
  const serviceTags = await prisma.serviceTag.findMany({
    include: {
      service: {
        select: {
          categoryId: true,
        },
      },
      tag: true,
    },
  });

  // 按分类ID分组标签
  const tagsByCategory: Record<
    number,
    Map<number, { tag: Tag; count: number }>
  > = {};

  // 统计每个分类下每个标签的使用次数
  for (const serviceTag of serviceTags) {
    const categoryId = serviceTag.service.categoryId;
    const tag = serviceTag.tag;

    if (!tagsByCategory[categoryId]) {
      tagsByCategory[categoryId] = new Map();
    }

    if (!tagsByCategory[categoryId].has(tag.id)) {
      tagsByCategory[categoryId].set(tag.id, { tag, count: 0 });
    }

    const tagData = tagsByCategory[categoryId].get(tag.id);
    if (tagData) {
      tagData.count += 1;
    }
  }

  // 转换为最终结果格式，每个分类取前5个热门标签
  const result: Record<number, Tag[]> = {};

  for (const [categoryId, tagsMap] of Object.entries(tagsByCategory)) {
    const categoryIdNum = Number(categoryId);
    const sortedTags = Array.from(tagsMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => item.tag);

    result[categoryIdNum] = sortedTags;
  }

  return result;
}

// 定义Banner类型
interface Banner {
  id: number;
  title: string;
  url: string;
  imageUrl: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// 获取头图数据
async function getActiveBanner(): Promise<Banner | null> {
  try {
    // 获取一个启用状态的头图，按排序和创建时间排序
    // 由于Prisma客户端尚未更新，使用原始SQL查询
    const banners = await prisma.$queryRaw<Banner[]>`
      SELECT * FROM Banner 
      WHERE isActive = true 
      ORDER BY sortOrder ASC, createdAt DESC 
      LIMIT 1
    `;

    return banners && banners.length > 0 ? banners[0] : null;
  } catch (error) {
    console.error('获取头图失败:', error);
    return null;
  }
}

export default async function Home() {
  const categories = await getCategoriesWithServices();
  const popularServices = await getPopularServices();
  const banner = await getActiveBanner();
  const tagsByCategory = await getPopularTagsByCategory();

  return (
    <div className="relative">
      {/* 左侧分类导航 - 固定在左侧，不影响主内容宽度 */}
      <div className="hidden xl:block w-30 fixed left-[max(0px,calc(50%-610px))] top-[103px] bg-white bg-opacity-80 backdrop-blur-sm shadow-sm rounded-lg overflow-y-auto max-h-[calc(100vh-120px)] z-10">
        <h2 className="font-medium text-brand-400 px-3 py-1.5 border-b-2 border-b-brand-50 border-t-4 border-t-brand-300">
          分类
        </h2>
        <div className="flex flex-col space-y-1 p-2">
          {categories.map(category => (
            <a
              key={category.id}
              href={`#category-${category.slug}`}
              className="category-nav-link text-gray-600 px-3 py-1 border-2 border-transparent hover:border-brand-100 hover:bg-brand-50 rounded transition-all duration-200 relative group flex items-center"
            >
              <CategoryIcon
                icon={category.icon}
                name={category.name}
                size={20}
              />
              <span className="truncate ml-2">{category.name}</span>
              <span className="absolute inset-0 bg-brand-50 border-brand-100 opacity-0 group-[.active-category]:opacity-100 rounded transition-opacity -z-10"></span>
            </a>
          ))}
        </div>

        {/* 返回顶部链接 */}
        <div className="border-t-2 border-brand-50 p-2">
          <BackToTopButton className="flex items-center justify-center text-gray-500 text-sm w-full px-2 py-1.5 border-2 bg-brand-50/50 hover:text-brand-400 border-brand-50 hover:bg-brand-50 hover:border-brand-100 rounded transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m5 12 7-7 7 7" />
              <path d="M12 19V5" />
            </svg>
            返回顶部
          </BackToTopButton>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="container mx-auto px-4 py-8 max-w-[960px]">
        {/* 头图区域 */}
        {banner && (
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 p-4 bg-white bg-opacity-80 rounded-lg shadow-sm">
            {/* 在移动端显示在上方的图片 */}
            <div className="w-full md:hidden mb-4">
              <Link href={banner.url} target="_blank">
                <Image
                  src={banner.imageUrl}
                  alt={banner.title}
                  width={450}
                  height={150}
                  className="rounded-md object-cover shadow-sm w-full"
                />
              </Link>
            </div>

            {/* 标题和描述 */}
            <div className="p-4 w-full md:w-1/2 md:flex-shrink-0 md:pr-8">
              <Link
                href={banner.url}
                className="text-2xl font-medium text-brand-400 hover:text-gray-800 hover:underline transition-all duration-200 block"
                target="_blank"
              >
                {banner.title}
              </Link>
              {banner.description && (
                <p className="text-gray-500 text-sm mt-2 leading-6">
                  {banner.description}
                </p>
              )}
            </div>

            {/* 在桌面端显示在右侧的图片 */}
            <div className="hidden md:block md:w-1/2 md:flex-shrink-0">
              <Link href={banner.url} target="_blank">
                <Image
                  src={banner.imageUrl}
                  alt={banner.title}
                  width={450}
                  height={150}
                  className="rounded-md object-cover shadow-sm w-full"
                  unoptimized
                />
              </Link>
            </div>
          </div>
        )}

        {/* 移动端分类导航 */}
        <div className="xl:hidden mb-10">
          <h2 className="text-2xl font-bold mb-2 pb-2">分类</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {categories.map(category => (
              <a
                key={category.id}
                href={`#category-${category.slug}`}
                className="px-4 py-2 bg-white outline-2 outline-none hover:outline-brand-200 transition-all duration-200 rounded-lg shadow-sm text-gray-700 hover:text-gray-900 flex items-center"
                data-category-id={`category-${category.slug}`}
              >
                <CategoryIcon
                  icon={category.icon}
                  name={category.name}
                  size={20}
                />
                <span className="ml-2">{category.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* 热门网站 */}
        <div className="mb-10">
          <h2 className="font-bold text-2xl mb-4 text-gray-800 pb-2 -space-y-2 inline-block">
            <span>热门</span>
            <span className="bg-brand-200 h-2 block w-full"></span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {popularServices.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>

        {/* 所有分类及网站 */}
        <div className="space-y-10">
          {categories.map(category => (
            <CategorySection
              key={category.id}
              category={category}
              services={category.services || []}
              tags={tagsByCategory[category.id] || []}
            />
          ))}
        </div>

        {/* 移动端返回顶部按钮 */}
        <div className="xl:hidden fixed bottom-6 right-6">
          <BackToTopButton className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg text-gray-400 hover:text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </BackToTopButton>
        </div>
      </div>

      {/* 添加分类导航样式 */}
      <CategoryNavStyles />

      {/* 添加平滑滚动功能 */}
      <SmoothScrollScript />
    </div>
  );
}
