import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { setAuthCookie } from '@/utils/auth';
import { errorResponse, serverErrorResponse } from '@/utils/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 验证请求数据
    if (!username || !password) {
      return errorResponse('用户名和密码不能为空');
    }

    // 查找管理员
    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    // 验证管理员存在
    if (!admin) {
      return errorResponse('用户名或密码错误');
    }

    // 验证密码
    const passwordValid = await compare(password, admin.password);
    if (!passwordValid) {
      return errorResponse('用户名或密码错误');
    }

    // 创建响应
    const response = NextResponse.json({
      success: true,
      message: '登录成功',
      data: {
        id: admin.id,
        username: admin.username,
      },
    });

    // 设置认证Cookie
    setAuthCookie(response, admin.id);

    return response;
  } catch (error) {
    console.error('登录处理错误:', error);
    return serverErrorResponse(error);
  }
}
