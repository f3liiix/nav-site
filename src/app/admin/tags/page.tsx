'use client';

// 导入Ant Design的React 19兼容补丁
import '@ant-design/v5-patch-for-react-19';
import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Popconfirm,
  Typography,
  Flex,
} from 'antd';
import type { TableProps } from 'antd';
import type { SortOrder } from 'antd/es/table/interface';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAdminApp } from '@/components/AdminAppProvider';
import type { Tag } from '@/types';

const { Title } = Typography;

// 扩展Tag类型，添加serviceCount字段
interface TagWithCount extends Tag {
  serviceCount: number;
}

interface Pagination {
  current: number;
  pageSize: number;
  total: number;
}

export default function TagsPage() {
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const { message } = useAdminApp();
  const [sortOrder, setSortOrder] = useState<SortOrder>('descend');

  // 获取标签列表
  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/tags?page=${currentPage}&pageSize=${pageSize}&sortOrder=${sortOrder}`
      );
      const data = await response.json();

      if (data.success) {
        const { data: tagsList, pagination: paginationData } = data.data;
        setTags(tagsList);
        // 更新分页信息
        setPagination(paginationData);
        setCurrentPage(paginationData.current);
        setPageSize(paginationData.pageSize);
      } else {
        message.error(data.message || '获取标签列表失败');
      }
    } catch (error) {
      console.error('获取标签列表失败:', error);
      message.error('获取标签列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [message, currentPage, pageSize, sortOrder]);

  // 初始加载
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // 添加或更新标签
  const handleSave = async (values: { name: string }) => {
    try {
      // 准备请求数据
      const tagData = {
        ...values,
      };

      // 发送请求
      const url = editingId
        ? `/api/admin/tags/${editingId}`
        : '/api/admin/tags';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tagData),
      });

      const data = await response.json();

      if (data.success) {
        message.success(editingId ? '更新标签成功' : '添加标签成功');
        setModalVisible(false);
        form.resetFields();
        setEditingId(null);
        // 重新获取标签列表
        await fetchTags();
      } else {
        message.error(
          data.message || (editingId ? '更新标签失败' : '添加标签失败')
        );
      }
    } catch (error) {
      console.error(editingId ? '更新标签失败:' : '添加标签失败:', error);
      message.error(
        editingId ? '更新标签失败，请稍后重试' : '添加标签失败，请稍后重试'
      );
    }
  };

  // 删除标签
  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/tags/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        message.success('删除标签成功');
        // 重新获取标签列表
        await fetchTags();
      } else {
        message.error(data.message || '删除标签失败');
      }
    } catch (error) {
      console.error('删除标签失败:', error);
      message.error('删除标签失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 编辑标签
  const handleEdit = (record: Tag) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
    });
    setModalVisible(true);
  };

  // 添加标签
  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 处理页码变化
  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) {
      setPageSize(size);
    }
  };

  // 处理每页条数变化
  const handlePageSizeChange = (current: number, size: number) => {
    setCurrentPage(current);
    setPageSize(size);
  };

  // 处理表格变化
  const handleTableChange: TableProps<TagWithCount>['onChange'] = (
    _,
    __,
    sorter
  ) => {
    if ('order' in sorter) {
      setSortOrder(sorter.order || 'descend');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '标签名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '网站数',
      dataIndex: 'serviceCount',
      key: 'serviceCount',
      width: 100,
      sorter: true,
      sortOrder,
      defaultSortOrder: 'descend' as SortOrder,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Tag) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="编辑"
          />
          <Popconfirm
            title="确定要删除这个标签吗?"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />} title="删除" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>
          标签管理
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加标签
        </Button>
      </Flex>

      <Table
        columns={columns}
        dataSource={tags}
        rowKey="id"
        loading={loading}
        onChange={handleTableChange}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: pagination.total,
          onChange: handlePageChange,
          onShowSizeChange: handlePageSizeChange,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: total => `共 ${total} 条`,
        }}
      />

      <Modal
        title={editingId ? '编辑标签' : '添加标签'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="name"
            label="标签名称"
            rules={[{ required: true, message: '请输入标签名称' }]}
          >
            <Input placeholder="请输入标签名称" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => setModalVisible(false)}
                style={{ marginRight: 8 }}
              >
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
