'use client';

import Link from 'next/link';

type FooterProps = {
  siteName: string;
  siteDescription?: string;
  statisticsCode?: string;
};

export default function Footer({
  siteName,
  siteDescription,
  statisticsCode,
}: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <>
      <footer className="py-6 text-sm">
        <div className="container mx-auto px-4 max-w-[960px]">
          <div className="flex space-x-4 items-center justify-center">
            <Link
              href="/"
              className="text-gray-600 hover:text-brand-400 transition-colors"
            >
              首页
            </Link>
            <span className="text-brand-100">|</span>
            <Link
              href="/about"
              className="text-gray-600 hover:text-brand-400 transition-colors"
            >
              关于我们
            </Link>
          </div>
          <div className="text-center text-gray-500 mt-2">
            <p>
              &copy; {year} {siteName} All Rights Reserved
            </p>
            {siteDescription && <p className="mt-2">{siteDescription}</p>}
          </div>
        </div>
      </footer>

      {/* 统计代码 */}
      {statisticsCode && (
        <div dangerouslySetInnerHTML={{ __html: statisticsCode }} />
      )}
    </>
  );
}
