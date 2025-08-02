'use client';

import Link from 'next/link';
import ServiceCard from './ServiceCard';
import { Category, Service, Tag } from '@/types';

interface CategorySectionProps {
  category: Category;
  services: Service[];
  tags?: Tag[];
}

export default function CategorySection({
  category,
  services,
  tags = [],
}: CategorySectionProps) {
  if (services.length === 0) return null;

  return (
    <section
      id={`category-${category.slug}`}
      className="scroll-mt-16 md:scroll-mt-20 lg:scroll-mt-24"
    >
      <div className="flex flex-wrap items-center mb-4 pb-2">
        <div className="flex-shrink-0 mr-4">
          <h2 className="font-bold text-2xl text-gray-800 whitespace-nowrap">
            <Link href={`/t/${category.slug}`} className="-space-y-2">
              <span className="relative -top-0.5">{category.name}</span>
              <span className="bg-brand-200 h-2 block w-full"></span>
            </Link>
          </h2>
        </div>

        {/* 分类下的热门标签 */}
        {tags && tags.length > 0 && (
          <div className="flex-1 flex justify-center overflow-hidden">
            <div className="flex flex-wrap gap-4 justify-center">
              {tags.map(tag => (
                <Link
                  key={tag.id}
                  href={`/tag/${encodeURIComponent(tag.name)}`}
                  className="text-sm px-3 py-1 text-gray-600 hover:text-brand-400 hover:bg-white/80 rounded-full transition-colors flex items-center"
                >
                  <span className="mr-1 text-brand-300">#</span>
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <Link
          href={`/t/${category.slug}`}
          className="flex-shrink-0 text-sm text-brand-300 hover:text-brand-400 shadow-sm bg-white px-3 py-1 rounded-full whitespace-nowrap ml-4"
        >
          更多
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {services.map(service => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </section>
  );
}
