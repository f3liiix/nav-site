import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin, getAdminIdFromRequest } from '@/utils/auth';
import {
  successResponse,
  unauthorizedResponse,
  errorResponse,
  serverErrorResponse,
} from '@/utils/api';
import { compare, hash } from 'bcryptjs';

// 修改密码
export async function PUT(request: NextRequest) {
  try {
    // 验证管理员身份
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return unauthorizedResponse();
    }

    // 获取管理员ID
    const adminId = getAdminIdFromRequest(request);
    if (!adminId) {
      return unauthorizedResponse('无法获取管理员信息');
    }

    // 解析请求数据
    const body = await request.json();
    const { oldPassword, newPassword } = body;

    // 验证数据
    if (!oldPassword || typeof oldPassword !== 'string') {
      return errorResponse('当前密码不能为空');
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return errorResponse('新密码不能为空');
    }

    if (newPassword.length < 6) {
      return errorResponse('新密码长度不能少于6个字符');
    }

    // 查询管理员信息
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      return unauthorizedResponse('管理员不存在');
    }

    // 验证旧密码
    const passwordValid = await compare(oldPassword, admin.password);
    if (!passwordValid) {
      return errorResponse('当前密码错误');
    }

    // 哈希新密码
    const hashedPassword = await hash(newPassword, 10);

    // 更新密码
    await prisma.admin.update({
      where: { id: adminId },
      data: {
        password: hashedPassword,
      },
    });

    return successResponse(null, '密码修改成功');
  } catch (error) {
    return serverErrorResponse(error);
  }
}
