import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/utils/auth';
import {
  successResponse,
  unauthorizedResponse,
  errorResponse,
  serverErrorResponse,
} from '@/utils/api';

// 定义Setting类型接口
interface SettingType {
  id: number;
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

// 获取所有设置
export async function GET(request: NextRequest) {
  try {
    // 验证管理员身份
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return unauthorizedResponse();
    }

    // 获取所有设置
    const settings = await prisma.$queryRaw<
      SettingType[]
    >`SELECT * FROM Setting`;

    // 转换为对象格式，方便前端使用
    const settingsObject = settings.reduce(
      (acc: Record<string, string>, setting: SettingType) => {
        acc[setting.key] = setting.value;
        return acc;
      },
      {}
    );

    return successResponse(settingsObject);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// 更新设置
export async function PUT(request: NextRequest) {
  try {
    // 验证管理员身份
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return unauthorizedResponse();
    }

    // 解析请求数据
    const body = await request.json();

    // 验证数据
    if (!body || typeof body !== 'object') {
      return errorResponse('无效的设置数据');
    }

    // 更新设置
    const updates = Object.entries(body).map(async ([key, value]) => {
      if (typeof value !== 'string') {
        return null;
      }

      // 使用Prisma的查询API代替原始SQL
      try {
        // 先尝试查找是否存在该设置
        const existingSetting = await prisma.$queryRaw<SettingType[]>`
          SELECT * FROM Setting WHERE \`key\` = ${key}
        `;

        if (existingSetting && existingSetting.length > 0) {
          // 如果存在，则更新
          return prisma.$executeRaw`
            UPDATE Setting SET \`value\` = ${value}, \`updatedAt\` = NOW() 
            WHERE \`key\` = ${key}
          `;
        } else {
          // 如果不存在，则插入
          return prisma.$executeRaw`
            INSERT INTO Setting (\`key\`, \`value\`, \`createdAt\`, \`updatedAt\`)
            VALUES (${key}, ${value}, NOW(), NOW())
          `;
        }
      } catch (err) {
        console.error(`更新设置 ${key} 失败:`, err);
        return null;
      }
    });

    await Promise.all(updates.filter(Boolean));

    return successResponse(null, '设置更新成功');
  } catch (error) {
    return serverErrorResponse(error);
  }
}
