import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ServiceCard from '@/components/ServiceCard';
import Link from 'next/link';
import { Category, Service } from '@/types';
import { getSiteSettings } from '@/utils/settings';
import Image from 'next/image';
import { NoData } from '@/components/icons/NoData';
import Pagination from '@/components/Pagination';

// 每页显示的数据条数
const PAGE_SIZE = 24;

// 定义路由参数类型
export interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// 动态生成元数据
export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  // 解析Promise获取参数
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // 解析searchParams
  await searchParams;

  // 查找分类
  const category = (await prisma.category.findUnique({
    where: { slug: slug } as { slug: string },
  })) as unknown as Category | null;

  if (!category) {
    return {
      title: '分类不存在',
    };
  }

  // 获取网站设置
  const settings = await getSiteSettings();

  // 使用分类的 SEO 设置，如果没有则使用默认值
  const title = category.seoTitle || `${category.name} - ${settings.siteName}`;
  const description =
    category.seoDescription ||
    category.description ||
    `${category.name}分类下的AI服务和应用`;
  const keywords = category.seoKeywords || settings.seoKeywords;

  return {
    title: title,
    description: description,
    keywords: keywords,
  };
}

// 获取分类下的服务总数
async function getServiceCount(categoryId: number): Promise<number> {
  const count = await prisma.service.count({
    where: {
      categoryId: categoryId,
    },
  });

  return count;
}

// 获取分类及其网站（带分页）
async function getCategoryWithServices(
  slug: string,
  page: number = 1,
  sortBy: 'clicks' | 'createdAt' = 'clicks'
): Promise<{
  category: Category | null;
  services: Service[];
  totalCount: number;
  totalPages: number;
}> {
  // 获取分类信息
  const category = (await prisma.category.findUnique({
    where: { slug: slug } as { slug: string },
  })) as unknown as Category | null;

  if (!category) {
    return {
      category: null,
      services: [],
      totalCount: 0,
      totalPages: 0,
    };
  }

  // 获取服务总数
  const totalCount = await getServiceCount(category.id);

  // 计算总页数
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // 确保页码有效
  const validPage = Math.max(1, Math.min(page, totalPages || 1));

  // 根据排序参数设置排序条件
  const orderBy =
    sortBy === 'clicks'
      ? { clickCount: 'desc' as const }
      : { createdAt: 'desc' as const };

  // 获取当前页的服务
  const services = (await prisma.service.findMany({
    where: {
      categoryId: category.id,
    },
    skip: (validPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    orderBy: orderBy,
  })) as unknown as Service[];

  return {
    category: {
      ...category,
      services: [],
    },
    services,
    totalCount,
    totalPages,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  // 解析Promise获取参数
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // 解析searchParams
  const resolvedSearchParams = await searchParams;
  const pageParam = resolvedSearchParams.page;
  const page = pageParam
    ? parseInt(Array.isArray(pageParam) ? pageParam[0] : pageParam)
    : 1;

  // 获取排序参数
  const sortParam = resolvedSearchParams.sort;
  const sort = sortParam
    ? Array.isArray(sortParam)
      ? sortParam[0]
      : sortParam
    : 'clicks';
  const sortBy = sort === 'time' ? 'createdAt' : 'clicks';

  // 获取分类及其服务
  const { category, services, totalCount, totalPages } =
    await getCategoryWithServices(slug, page, sortBy as 'clicks' | 'createdAt');

  // 如果分类不存在，返回404
  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-[960px]">
      <div className="pl-4 relative -bottom-1">
        <Link
          href="/"
          className="text-brand-300 hover:text-brand-400 bg-white bg-opacity-80 pl-2 pr-3.5 py-2 rounded-t-lg text-sm inline-flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="text-brand-300"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          返回首页
        </Link>
      </div>
      <div className="bg-white bg-opacity-60 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex sm:flex-row flex-col items-center justify-center sm:justify-start">
          <h1 className="text-3xl font-bold flex items-center">
            {category.icon ? (
              <div className="relative w-10 h-10 mr-2 flex-shrink-0">
                <Image
                  src={category.icon}
                  alt={category.name}
                  fill
                  className="object-contain"
                  unoptimized={category.icon.endsWith('.svg')}
                  priority
                />
              </div>
            ) : (
              <div className="w-10 h-10 mr-2 flex items-center justify-center bg-brand-100 rounded-full flex-shrink-0">
                <span className="text-lg font-bold text-brand-700">
                  {category.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="ml-1">{category.name}</span>
          </h1>

          {category.description && (
            <div className="mt-2 sm:mt-0 ml-0 sm:ml-8 text-center">
              <p className="text-gray-500 leading-relaxed">
                {category.description}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-gray-500">
          共 <span className="font-medium text-brand-400">{totalCount}</span>{' '}
          个网站 {totalPages > 1 && `(第 ${page}/${totalPages} 页)`}
        </h3>

        <div className="flex space-x-2">
          <Link
            href={`/t/${slug}?sort=clicks${page > 1 ? `&page=${page}` : ''}`}
            className={`px-3 py-1 rounded text-sm shadow-sm ${sortBy === 'clicks' ? 'bg-brand-400 text-white' : 'bg-white bg-opacity-80 text-brand-300 hover:text-brand-400'}`}
          >
            按热度排序
          </Link>
          <Link
            href={`/t/${slug}?sort=time${page > 1 ? `&page=${page}` : ''}`}
            className={`px-3 py-1 rounded text-sm shadow-sm ${sortBy === 'createdAt' ? 'bg-brand-400 text-white' : 'bg-white bg-opacity-80 text-brand-300 hover:text-brand-400'}`}
          >
            按时间排序
          </Link>
        </div>
      </div>

      {services.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {services.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="bg-white bg-opacity-80 rounded-lg shadow-sm p-10 text-center flex flex-col items-center justify-center">
          <NoData />
          <p className="text-gray-400 mt-8">该分类下暂无数据</p>
        </div>
      )}

      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl={`/t/${slug}`}
            queryParams={{ sort: sort }}
          />
        </div>
      )}
    </div>
  );
}
