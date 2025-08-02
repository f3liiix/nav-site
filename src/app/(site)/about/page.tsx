import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '关于我们 - 123.SS',
  description: '了解123.SS AI导航网站的使命和目标',
};

export default function AboutPage() {
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
      <div className="bg-white bg-opacity-80 rounded-lg shadow-sm p-8 mb-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          关于我们
        </h1>

        <div className="space-y-6 text-gray-600">
          <p>
            123.SS是一个AI网址导航，专注于收录和推荐优质AI服务和应用。我们的使命是帮助用户快速找到适合自己需求的AI工具，提高工作效率和创新能力。
          </p>

          <h2 className="text-xl font-semibold text-gray-700 mt-8">
            我们的目标
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>收录全面：覆盖各个领域的AI服务和应用</li>
            <li>精选优质：严格筛选，只推荐高质量的AI工具</li>
            <li>分类清晰：通过科学的分类，帮助用户快速定位</li>
            <li>搜索便捷：提供强大的搜索功能，满足精准查找需求</li>
            <li>持续更新：不断收录新的AI服务，保持内容的时效性</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-700 mt-8">联系我们</h2>
          <p>
            如果您有任何建议、反馈或合作意向，欢迎联系我们。我们非常重视用户的意见，并致力于不断改进我们的服务。
          </p>
          <p className="mt-2">
            联系邮箱：
            <a
              href="mailto:me@hide.ss"
              className="text-brand-400 hover:underline"
            >
              me@hide.ss
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
