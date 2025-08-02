'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Avatar,
  Typography,
  Flex,
} from 'antd';
import {
  AppstoreOutlined,
  TagsOutlined,
  BarChartOutlined,
  EyeOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import Image from 'next/image';

const { Title } = Typography;

// 统计数据类型
interface Stats {
  serviceCount: number;
  categoryCount: number;
  totalClicks: number;
}

// 热门网站类型
interface PopularService {
  id: number;
  name: string;
  url: string;
  icon: string | null;
  clickCount: number;
  categoryName: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    serviceCount: 0,
    categoryCount: 0,
    totalClicks: 0,
  });
  const [popularServices, setPopularServices] = useState<PopularService[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取统计数据
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        const data = await response.json();

        if (data.success) {
          setStats(data.data);
        } else {
          console.error('获取统计数据失败:', data.message);
        }
      } catch (error) {
        console.error('获取统计数据失败:', error);
      }
    };

    fetchStats();
  }, []);

  // 获取热门网站
  useEffect(() => {
    const fetchPopularServices = async () => {
      try {
        const response = await fetch('/api/admin/popular-services');
        const data = await response.json();

        if (data.success) {
          setPopularServices(data.data);
        } else {
          console.error('获取热门网站失败:', data.message);
        }
      } catch (error) {
        console.error('获取热门网站失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularServices();
  }, []);

  // 判断文件是否为SVG
  const isSvg = (filename: string | null): boolean => {
    if (!filename) return false;
    return filename.toLowerCase().endsWith('.svg');
  };

  // 表格列定义
  const columns = [
    {
      title: '网站名称',
      dataIndex: 'name',
      key: 'name',
      render: (_: unknown, record: PopularService) => (
        <Flex align="center">
          {record.icon ? (
            <div
              style={{
                marginRight: 8,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {isSvg(record.icon) ? (
                <Image
                  src={record.icon}
                  alt={record.name}
                  width={32}
                  height={32}
                  style={{ borderRadius: 4, display: 'block' }}
                  unoptimized
                />
              ) : (
                <Image
                  src={record.icon}
                  alt={record.name}
                  width={32}
                  height={32}
                  style={{ borderRadius: 4, display: 'block' }}
                />
              )}
            </div>
          ) : (
            <Avatar
              icon={<GlobalOutlined />}
              size={32}
              style={{ marginRight: 8, flexShrink: 0 }}
            />
          )}
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {record.name}
          </span>
        </Flex>
      ),
    },
    {
      title: '所属分类',
      dataIndex: 'categoryName',
      key: 'categoryName',
    },
    {
      title: '点击次数',
      dataIndex: 'clickCount',
      key: 'clickCount',
      sorter: (a: PopularService, b: PopularService) =>
        a.clickCount - b.clickCount,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: PopularService) => (
        <Button
          type="default"
          icon={<EyeOutlined />}
          onClick={() => window.open(record.url, '_blank')}
        >
          访问
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24, marginTop: 0 }}>
        控制面板
      </Title>

      <Row gutter={16} style={{ marginBottom: 32 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="网站总数"
              value={stats.serviceCount}
              prefix={<AppstoreOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="分类总数"
              value={stats.categoryCount}
              prefix={<TagsOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="总点击次数"
              value={stats.totalClicks}
              prefix={<BarChartOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Title level={4} style={{ marginBottom: 24, marginTop: 0 }}>
        热门网站
      </Title>

      <Table
        columns={columns}
        dataSource={popularServices}
        rowKey="id"
        bordered
        loading={loading}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
      />
    </div>
  );
}
