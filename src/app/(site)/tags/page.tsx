import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { getSiteSettings } from '@/utils/settings';
import { Tag } from '@/types';

// 设置页面不缓存，每次请求都重新渲染
export const revalidate = 0;

// 定义标签及其服务数量的类型
interface TagWithCount extends Tag {
  serviceCount: number;
}

// 动态生成元数据
export async function generateMetadata(): Promise<Metadata> {
  // 获取网站设置
  const settings = await getSiteSettings();

  return {
    title: `标签列表 - ${settings.siteName}`,
    description: `浏览${settings.siteName}上的所有AI标签分类`,
    keywords: `标签,分类,AI,应用,${settings.siteKeywords || ''}`,
  };
}

// 获取所有标签及其服务数量
async function getTagsWithCount(): Promise<TagWithCount[]> {
  // 获取所有标签
  const tags = await prisma.tag.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  // 获取每个标签关联的服务数量
  const tagsWithCount = await Promise.all(
    tags.map(async tag => {
      const serviceCount = await prisma.serviceTag.count({
        where: {
          tagId: tag.id,
        },
      });

      return {
        ...tag,
        serviceCount,
      };
    })
  );

  // 按服务数量降序排序
  return tagsWithCount.sort((a, b) => b.serviceCount - a.serviceCount);
}

// 标签列表页面组件
export default async function TagsPage() {
  // 获取所有标签及其服务数量
  const tags = await getTagsWithCount();

  // 按服务数量分组
  const popularTags = tags.filter(tag => tag.serviceCount >= 5);
  const regularTags = tags.filter(
    tag => tag.serviceCount > 0 && tag.serviceCount < 5
  );
  const unusedTags = tags.filter(tag => tag.serviceCount === 0);

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

      <div className="bg-white bg-opacity-60 rounded-lg shadow-sm p-6 mb-6 flex items-center">
        <h1 className="text-3xl font-bold text-gray-700">标签列表</h1>
        <p className="text-gray-500 ml-4">
          共 <span className="font-medium">{tags.length}</span> 个标签
        </p>
      </div>

      {/* 热门标签 */}
      {popularTags.length > 0 && (
        <div className="bg-white bg-opacity-60 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">热门标签</h2>
          <div className="flex flex-wrap gap-3">
            {popularTags.map(tag => (
              <Link
                key={tag.id}
                href={`/tag/${encodeURIComponent(tag.name)}`}
                className="px-4 py-2 bg-white border-2 border-brand-100 text-brand-400 shadow-sm rounded-full hover:border-brand-200 transition-colors flex items-center"
              >
                <span className="text-brand-200 mr-2">#</span>
                <span>{tag.name}</span>
                <span className="ml-2 bg-brand-100 text-brand-400 text-xs px-2 py-1 rounded-full">
                  {tag.serviceCount}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 常规标签 */}
      {regularTags.length > 0 && (
        <div className="bg-white bg-opacity-60 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">其他标签</h2>
          <div className="flex flex-wrap gap-3">
            {regularTags.map(tag => (
              <Link
                key={tag.id}
                href={`/tag/${encodeURIComponent(tag.name)}`}
                className="px-4 py-2 bg-white text-gray-700 rounded-full shadow-sm border-2 border-gray-200 hover:border-gray-300 transition-colors flex items-center"
              >
                <span className="text-gray-300 mr-2">#</span>
                <span>{tag.name}</span>
                <span className="ml-2 bg-gray-200 text-gray-500 text-xs px-2 py-1 rounded-full">
                  {tag.serviceCount}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 未使用的标签 */}
      {unusedTags.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            未使用的标签
          </h2>
          <div className="flex flex-wrap gap-3">
            {unusedTags.map(tag => (
              <span
                key={tag.id}
                className="px-4 py-2 bg-gray-50 text-gray-400 rounded-full cursor-not-allowed"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
