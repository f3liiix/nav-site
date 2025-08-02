import { successResponse, serverErrorResponse } from '@/utils/api';
import { prisma } from '@/lib/prisma';

interface SettingType {
  id: number;
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

// 获取所有设置
export async function GET() {
  try {
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
