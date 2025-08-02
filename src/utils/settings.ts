import { prisma } from '@/lib/prisma';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  statisticsCode: string;
  seoTitle: string;
  seoKeywords: string;
  seoDescription: string;
  [key: string]: string;
}

interface SettingRecord {
  id: number;
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

// 获取网站设置
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    // 获取所有设置
    const settings = await prisma.$queryRaw<
      SettingRecord[]
    >`SELECT * FROM Setting`;

    // 转换为对象格式
    const settingsObject = settings.reduce(
      (acc: Record<string, string>, setting: SettingRecord) => {
        acc[setting.key] = setting.value;
        return acc;
      },
      {}
    );

    // 设置默认值
    const result = {
      siteName: settingsObject.siteName || 'AI导航',
      siteDescription:
        settingsObject.siteDescription || '收录优质AI服务和应用的导航网站',
      statisticsCode: settingsObject.statisticsCode || '',
      seoTitle: settingsObject.seoTitle || '',
      seoKeywords: settingsObject.seoKeywords || '',
      seoDescription: settingsObject.seoDescription || '',
      ...settingsObject,
    };

    return result;
  } catch (error) {
    console.error('获取设置失败:', error);
    // 返回默认设置
    return {
      siteName: 'AI导航',
      siteDescription: '收录优质AI服务和应用的导航网站',
      statisticsCode: '',
      seoTitle: '',
      seoKeywords: '',
      seoDescription: '',
    };
  }
}
