import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// 上传目录
const UPLOAD_DIR = process.env.NEXT_PUBLIC_UPLOAD_DIR || 'uploads';
const UPLOAD_PATH = join(process.cwd(), 'public', UPLOAD_DIR);

// 确保上传目录存在
export const ensureUploadDir = async () => {
  if (!existsSync(UPLOAD_PATH)) {
    await mkdir(UPLOAD_PATH, { recursive: true });
  }
};

// 保存上传的文件
export const saveFile = async (
  file: File,
  customFilename?: string
): Promise<string> => {
  await ensureUploadDir();

  // 生成文件名
  const originalName = file.name;
  const ext = originalName.split('.').pop() || '';
  const filename = customFilename
    ? `${customFilename}.${ext}`
    : `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${ext}`;

  // 读取文件内容
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 保存文件
  const filePath = join(UPLOAD_PATH, filename);
  await writeFile(filePath, buffer);

  // 返回相对路径
  return `/${UPLOAD_DIR}/${filename}`;
};

// 获取文件URL
export const getFileUrl = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return path;
  return `/${UPLOAD_DIR}/${path}`;
};
