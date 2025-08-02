import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ServiceCard from '@/components/ServiceCard';
import Link from 'next/link';
import { Service, Tag } from '@/types';
import { getSiteSettings } from '@/utils/settings';
import { NoData } from '@/components/icons/NoData';
import Pagination from '@/components/Pagination';

// 每页显示的数据条数
const PAGE_SIZE = 24;

// 定义路由参数类型
export interface TagPageProps {
  params: Promise<{ name: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// 动态生成元数据
export async function generateMetadata({
  params,
  searchParams,
}: TagPageProps): Promise<Metadata> {
  // 解析Promise获取参数
  const resolvedParams = await params;
  const name = decodeURIComponent(resolvedParams.name);

  // 解析searchParams
  await searchParams;

  // 查找标签
  const tag = await prisma.tag.findFirst({
    where: {
      name: {
        equals: name,
      },
    },
  });

  if (!tag) {
    return {
      title: '标签不存在',
    };
  }

  // 获取网站设置
  const settings = await getSiteSettings();

  // 使用标签的名称生成标题和描述
  const title = `${tag.name}相关的AI应用和服务，${tag.name}相关网站 - ${settings.siteName}`;
  const description = `"${tag.name}"相关的所有AI应用和服务`;

  return {
    title,
    description,
    keywords: `${tag.name},${tag.name}应用,${tag.name}服务,${tag.name}网站,${settings.siteKeywords || ''}`,
  };
}

// 获取标签关联的服务数量
async function getServiceCount(tagId: number): Promise<number> {
  const count = await prisma.serviceTag.count({
    where: {
      tagId,
    },
  });
  return count;
}

// 获取标签及其关联的服务
async function getTagWithServices(
  name: string,
  page: number = 1,
  sortBy: 'clicks' | 'createdAt' = 'clicks'
): Promise<{
  tag: Tag | null;
  services: Service[];
  totalCount: number;
  totalPages: number;
}> {
  // 查找标签
  const tag = await prisma.tag.findFirst({
    where: {
      name: {
        equals: name,
      },
    },
  });

  if (!tag) {
    return {
      tag: null,
      services: [],
      totalCount: 0,
      totalPages: 0,
    };
  }

  // 计算分页
  const skip = (page - 1) * PAGE_SIZE;

  // 获取服务总数
  const totalCount = await getServiceCount(tag.id);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // 获取标签关联的服务
  const serviceTagRelations = await prisma.serviceTag.findMany({
    where: {
      tagId: tag.id,
    },
    include: {
      service: {
        include: {
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },
    },
    skip,
    take: PAGE_SIZE,
  });

  // 提取服务并添加分类信息
  const services = serviceTagRelations.map(relation => ({
    ...relation.service,
    categoryName: relation.service.category.name,
    categorySlug: relation.service.category.slug,
  }));

  // 根据排序方式对服务进行排序
  services.sort((a, b) => {
    if (sortBy === 'clicks') {
      return b.clickCount - a.clickCount;
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return {
    tag,
    services,
    totalCount,
    totalPages,
  };
}

// 标签页面组件
export default async function TagPage({ params, searchParams }: TagPageProps) {
  // 解析Promise获取参数
  const resolvedParams = await params;
  const name = decodeURIComponent(resolvedParams.name);

  // 解析searchParams
  const resolvedSearchParams = await searchParams;

  // 获取页码和排序方式
  const pageParam = resolvedSearchParams.page;
  const page = typeof pageParam === 'string' ? parseInt(pageParam, 10) || 1 : 1;

  const sortByParam = resolvedSearchParams.sort;
  const sortBy =
    typeof sortByParam === 'string' && sortByParam === 'new'
      ? 'createdAt'
      : 'clicks';

  // 获取标签及其服务
  const { tag, services, totalCount, totalPages } = await getTagWithServices(
    name,
    page,
    sortBy
  );

  // 如果标签不存在，返回404
  if (!tag) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-[960px]">
      <div className="pl-4 relative -bottom-1">
        <ol className="inline-flex items-center whitespace-nowrap text-brand-300 hover:text-brand-400 bg-white bg-opacity-80 px-3.5 py-2 rounded-t-lg text-sm">
          <li className="inline-flex items-center">
            <Link
              className="flex items-center text-sm text-brand-300 hover:text-brand-400 focus:outline-hidden focus:text-brand-400"
              href="/"
            >
              首页
            </Link>
            <svg
              className="shrink-0 mx-2 size-4 text-gray-300 dark:text-neutral-600"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6"></path>
            </svg>
          </li>
          <li className="inline-flex items-center">
            <a
              className="flex items-center text-sm text-brand-300 hover:text-brand-400 focus:outline-hidden focus:text-brand-400"
              href="/tags"
            >
              标签
            </a>
          </li>
        </ol>
      </div>

      <div className="bg-white bg-opacity-60 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-center sm:justify-start">
          <h1 className="text-3xl font-bold text-brand-400">
            # <span className="text-gray-700">{tag.name}</span>
          </h1>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-gray-500">
          共 <span className="font-medium text-brand-400">{totalCount}</span>{' '}
          个网站 {totalPages > 1 && `(第 ${page}/${totalPages} 页)`}
        </h3>

        <div className="flex space-x-2">
          <Link
            href={`/tag/${encodeURIComponent(name)}`}
            className={`px-3 py-1 rounded text-sm shadow-sm ${sortBy === 'clicks' ? 'bg-brand-400 text-white' : 'bg-white bg-opacity-80 text-brand-300 hover:text-brand-400'}`}
          >
            按热度排序
          </Link>
          <Link
            href={`/tag/${encodeURIComponent(name)}?sort=new`}
            className={`px-3 py-1 rounded text-sm shadow-sm ${sortBy === 'createdAt' ? 'bg-brand-400 text-white' : 'bg-white bg-opacity-80 text-brand-300 hover:text-brand-400'}`}
          >
            按时间排序
          </Link>
        </div>
      </div>

      {/* 服务列表 */}
      {services.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {services.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 bg-white bg-opacity-60 rounded-lg shadow-sm">
          <NoData className="w-32 h-32 text-gray-300" />
          <p className="mt-4 text-gray-500">暂无相关服务</p>
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl={`/tag/${encodeURIComponent(name)}${sortBy === 'createdAt' ? '?sort=new' : ''}`}
          />
        </div>
      )}
    </div>
  );
}
