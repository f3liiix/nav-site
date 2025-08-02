import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { verifyAdmin } from '@/utils/auth';
import {
  successResponse,
  unauthorizedResponse,
  errorResponse,
  serverErrorResponse,
} from '@/utils/api';

// 文件上传API
export async function POST(request: NextRequest) {
  try {
    // 验证管理员身份
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return unauthorizedResponse();
    }

    // 解析FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'icon'; // 默认为icon类型

    if (!file) {
      return errorResponse('未找到文件');
    }

    // 验证文件类型
    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ];
    if (!validTypes.includes(file.type)) {
      return errorResponse(
        '不支持的文件类型，请上传JPG、PNG、GIF、WEBP或SVG格式的图片'
      );
    }

    // 验证文件大小（最大5MB）
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return errorResponse('文件大小不能超过5MB');
    }

    // 生成文件名
    const timestamp = Date.now();
    const originalName = file.name;
    const extension = originalName.split('.').pop() || 'jpg';

    // 根据类型确定保存目录和文件名前缀
    let uploadDir;
    let filePrefix;
    let urlPrefix;

    if (type === 'service' || type === 'icon') {
      uploadDir = join(process.cwd(), 'public', 'uploads', 'icons');
      filePrefix = 'icon';
      urlPrefix = '/uploads/icons';
    } else if (type === 'category') {
      uploadDir = join(process.cwd(), 'public', 'uploads', 'categories');
      filePrefix = 'category';
      urlPrefix = '/uploads/categories';
    } else if (type === 'banner') {
      // 头图类型
      uploadDir = join(process.cwd(), 'public', 'uploads', 'banners');
      filePrefix = 'banner';
      urlPrefix = '/uploads/banners';
    } else {
      // 未知类型，默认为icon
      uploadDir = join(process.cwd(), 'public', 'uploads', 'icons');
      filePrefix = 'icon';
      urlPrefix = '/uploads/icons';
    }

    const fileName = `${filePrefix}_${timestamp}.${extension}`;

    // 确保上传目录存在
    await mkdir(uploadDir, { recursive: true });

    // 保存文件
    const filePath = join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // 返回文件URL
    const fileUrl = `${urlPrefix}/${fileName}`;

    return successResponse({ url: fileUrl, path: fileUrl }, '文件上传成功');
  } catch (error) {
    return serverErrorResponse(error);
  }
}
