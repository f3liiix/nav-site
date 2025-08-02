import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from './utils/auth';

// 需要保护的路径
const PROTECTED_PATHS = ['/admin'];
// 不需要保护的路径
const PUBLIC_PATHS = ['/admin/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 为静态资源添加缓存控制头
  if (
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/static/') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js')
  ) {
    // 创建响应
    const response = NextResponse.next();

    // 添加缓存控制头，防止缓存
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  }

  // 处理分类URL重写：将/t/xxx映射到/category/xxx
  if (pathname.startsWith('/t/')) {
    const slug = pathname.replace('/t/', '');
    const url = request.nextUrl.clone();
    url.pathname = `/category/${slug}`;
    return NextResponse.rewrite(url);
  }

  // 检查是否是管理后台路径
  const isAdminPath = PROTECTED_PATHS.some(path => pathname.startsWith(path));

  // 如果不是管理后台路径，直接放行
  if (!isAdminPath) {
    return NextResponse.next();
  }

  // 如果是公开路径，直接放行
  if (PUBLIC_PATHS.some(path => pathname === path)) {
    return NextResponse.next();
  }

  // 验证管理员身份 - 只检查Token，不查询数据库
  const isAdmin = verifyAdminToken(request);

  // 如果验证失败，重定向到登录页面
  if (!isAdmin) {
    const url = new URL('/admin/login', request.url);
    return NextResponse.redirect(url);
  }

  // 验证成功，放行
  return NextResponse.next();
}

// 配置匹配的路由
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了:
     * - api 路由
     * - 静态文件 (如 images, js, css, etc.)
     * - favicon.ico
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/_next/static/:path*',
  ],
};
