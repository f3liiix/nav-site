'use client';

import { useState, useEffect, useCallback } from 'react';
import { Typography, Flex } from 'antd';

const { Text } = Typography;

interface VersionInfoProps {
  className?: string;
}

interface BuildInfo {
  version: string;
  buildId: string;
  buildTime: string;
}

const VersionInfo: React.FC<VersionInfoProps> = ({ className }) => {
  const [buildInfo, setBuildInfo] = useState<BuildInfo>({
    version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
    buildId: '',
    buildTime: '',
  });

  // 安全地解析日期
  const safeParseDate = (dateStr: string): string => {
    try {
      // 检查是否是 HTML 内容
      if (dateStr.includes('<!DOCTYPE html>') || dateStr.includes('<html')) {
        console.error('收到 HTML 内容而非日期字符串');
        return '未知时间';
      }

      // 首先检查是否已经是格式化的日期字符串
      if (dateStr.includes('-') || dateStr.includes('/')) {
        return dateStr;
      }

      // 尝试将字符串解析为数字
      const timestamp = parseInt(dateStr, 10);
      if (isNaN(timestamp)) {
        return '未知时间';
      }

      // 创建日期对象并格式化
      const date = new Date(timestamp * 1000); // 假设是秒级时间戳

      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        // 尝试毫秒级时间戳
        const msDate = new Date(timestamp);
        if (isNaN(msDate.getTime())) {
          return '未知时间';
        }
        return msDate.toLocaleString();
      }

      return date.toLocaleString();
    } catch (error) {
      console.error('日期解析错误:', error);
      return '未知时间';
    }
  };

  // 检查响应是否为 JSON
  const isJsonResponse = (text: string): boolean => {
    try {
      // 尝试解析为 JSON
      JSON.parse(text);
      return true;
    } catch {
      // 如果解析失败，检查是否为 HTML
      return !(text.includes('<!DOCTYPE html>') || text.includes('<html'));
    }
  };

  // 获取当前时间作为开发环境的构建时间
  const getCurrentTime = (): string => {
    return new Date().toLocaleString();
  };

  // 使用useCallback包装获取版本信息的逻辑，避免在依赖数组中直接使用对象
  const fetchVersionInfo = useCallback(async () => {
    // 在开发环境中使用当前时间
    if (process.env.NODE_ENV === 'development') {
      setBuildInfo(prev => ({
        ...prev,
        buildTime: getCurrentTime(),
        buildId: 'dev-' + Date.now(),
      }));
      return;
    }

    try {
      // 尝试从版本信息文件获取信息 - 使用正确的路径
      const res = await fetch('/_next/static/version/info.json');
      if (!res.ok) {
        throw new Error('版本信息文件不存在');
      }

      const text = await res.text();

      // 验证响应是否为 JSON
      if (!isJsonResponse(text)) {
        throw new Error('版本信息文件格式错误');
      }

      const data = JSON.parse(text);
      setBuildInfo(prev => ({
        version: data.version || prev.version,
        buildId: data.buildId || prev.buildId,
        buildTime: data.buildTime
          ? safeParseDate(data.buildTime)
          : prev.buildTime,
      }));
    } catch (error) {
      console.error('获取版本信息文件失败:', error);
      try {
        // 如果版本信息文件不存在，尝试从构建ID获取信息
        const res = await fetch('/_next/build-id');
        if (!res.ok) {
          throw new Error('构建ID不存在');
        }

        const text = await res.text();

        // 验证响应不是 HTML
        if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
          throw new Error('构建ID响应为 HTML');
        }

        const buildId = text.trim();
        // 将时间戳转换为可读格式
        const buildTime = safeParseDate(buildId);
        setBuildInfo(prev => ({ ...prev, buildId, buildTime }));
      } catch (err) {
        console.error('获取构建ID失败:', err);
        // 所有方法都失败时，使用当前时间作为回退
        setBuildInfo(prev => ({
          ...prev,
          buildTime: getCurrentTime(),
          buildId: 'fallback-' + Date.now(),
        }));
      }
    }
  }, []);

  // 使用useEffect调用获取版本信息的函数
  useEffect(() => {
    fetchVersionInfo();
  }, [fetchVersionInfo]);

  return (
    <Flex
      justify="center"
      align="center"
      wrap="wrap"
      gap="small"
      className={className}
      style={{ paddingTop: 8, paddingBottom: 8 }}
    >
      <div
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: 150,
        }}
      >
        <Text style={{ fontSize: 12, color: '#999' }}>
          版本: {buildInfo.version}
        </Text>
      </div>
      <div
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: 200,
        }}
      >
        <Text style={{ fontSize: 12, color: '#999' }}>
          构建时间: {buildInfo.buildTime || '加载中...'}
        </Text>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <div style={{ whiteSpace: 'nowrap' }}>
          <Text style={{ fontSize: 12 }} type="success">
            开发模式
          </Text>
        </div>
      )}
    </Flex>
  );
};

export default VersionInfo;
