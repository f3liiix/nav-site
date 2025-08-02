'use client';

import '@ant-design/v5-patch-for-react-19';
import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  Switch,
  InputNumber,
  Typography,
  Space,
  Popconfirm,
  Flex,
} from 'antd';
import Image from 'next/image';
import {
  PlusOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import type { ColumnsType } from 'antd/es/table';
import { useAdminApp } from '@/components/AdminAppProvider';

const { Title } = Typography;
// const { TextArea } = Input;

interface Banner {
  id: number;
  title: string;
  url: string;
  imageUrl: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface BannerFormValues {
  title: string;
  url: string;
  imageUrl: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

export default function BannersPage() {
  const [form] = Form.useForm<BannerFormValues>();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('添加头图');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { message: adminMessage } = useAdminApp();

  // 获取所有头图
  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/banners');
      const data = await response.json();

      if (data.success) {
        setBanners(data.data);
      } else {
        adminMessage.error(data.message || '获取头图列表失败');
      }
    } catch (error) {
      console.error('获取头图列表失败:', error);
      adminMessage.error('获取头图列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [adminMessage]);

  // 初始加载
  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // 打开添加头图模态框
  const showAddModal = () => {
    setModalTitle('添加头图');
    setEditingId(null);
    form.resetFields();
    setFileList([]);
    setModalVisible(true);
  };

  // 打开编辑头图模态框
  const showEditModal = (banner: Banner) => {
    setModalTitle('编辑头图');
    setEditingId(banner.id);
    form.setFieldsValue({
      title: banner.title,
      url: banner.url,
      imageUrl: banner.imageUrl,
      description: banner.description,
      isActive: banner.isActive,
      sortOrder: banner.sortOrder,
    });

    // 设置文件列表，显示已有图片
    setFileList([
      {
        uid: '-1',
        name: banner.imageUrl.split('/').pop() || 'image.png',
        status: 'done',
        url: banner.imageUrl,
      },
    ]);

    setModalVisible(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setModalVisible(false);
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // 确保imageUrl是字符串
      if (!values.imageUrl || typeof values.imageUrl !== 'string') {
        if (
          fileList.length > 0 &&
          fileList[0].response &&
          fileList[0].response.url
        ) {
          values.imageUrl = fileList[0].response.url;
        } else if (fileList.length > 0 && fileList[0].url) {
          values.imageUrl = fileList[0].url;
        } else {
          adminMessage.error('图片上传失败，请重新上传');
          return;
        }
      }

      // 确保URL是绝对路径
      if (
        values.imageUrl &&
        !values.imageUrl.startsWith('/') &&
        !values.imageUrl.startsWith('http')
      ) {
        values.imageUrl = `/${values.imageUrl}`;
      }

      if (editingId) {
        // 更新头图
        const response = await fetch(`/api/admin/banners/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        if (data.success) {
          adminMessage.success('头图更新成功');
          setModalVisible(false);
          fetchBanners();
        } else {
          adminMessage.error(data.message || '更新头图失败');
        }
      } else {
        // 添加头图
        const response = await fetch('/api/admin/banners', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        if (data.success) {
          adminMessage.success('头图添加成功');
          setModalVisible(false);
          fetchBanners();
        } else {
          adminMessage.error(data.message || '添加头图失败');
        }
      }
    } catch (error) {
      console.error('提交表单失败:', error);
    }
  };

  // 删除头图
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/banners/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        adminMessage.success('头图删除成功');
        fetchBanners();
      } else {
        adminMessage.error(data.message || '删除头图失败');
      }
    } catch (error) {
      console.error('删除头图失败:', error);
      adminMessage.error('删除头图失败，请稍后重试');
    }
  };

  // 上传图片前的校验
  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      adminMessage.error('只能上传图片文件!');
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      adminMessage.error('图片大小不能超过5MB!');
      return false;
    }

    return true;
  };

  // 自定义上传
  const customUpload: UploadProps['customRequest'] = async options => {
    const { file, onSuccess, onError } = options;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file as File);
      formData.append('type', 'banner'); // 指定上传类型为头图

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        adminMessage.success('图片上传成功');
        // 确保设置的是字符串URL
        const imageUrl = data.data.url;
        form.setFieldsValue({ imageUrl });
        if (onSuccess) {
          onSuccess({ url: imageUrl });
        }
      } else {
        adminMessage.error(data.message || '图片上传失败');
        if (onError) {
          onError(new Error(data.message || '图片上传失败'));
        }
      }
    } catch (error) {
      console.error('图片上传失败:', error);
      adminMessage.error('图片上传失败，请稍后重试');
      if (onError) {
        onError(error as Error);
      }
    } finally {
      setUploading(false);
    }
  };

  // 处理上传状态变化
  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);

    // 确保在提交表单时使用正确的图片URL
    if (newFileList.length > 0 && newFileList[0].response) {
      const imageUrl = newFileList[0].response.url;
      form.setFieldsValue({ imageUrl });
    }
  };

  // 表格列定义
  const columns: ColumnsType<Banner> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 200,
      render: text => text || '-',
    },
    {
      title: '链接',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
      render: text => (
        <a href={text} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: '图片',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 120,
      render: imageUrl => (
        <div
          style={{
            width: 100,
            height: 50,
            position: 'relative',
            cursor: 'pointer',
          }}
          onClick={() => setPreviewImage(imageUrl)}
        >
          <Image
            src={imageUrl}
            alt="头图"
            fill
            style={{ objectFit: 'cover' }}
            unoptimized
          />
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          />
          <Popconfirm
            title="确定要删除这个头图吗?"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>
          头图管理
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          添加头图
        </Button>
      </Flex>

      <Table
        columns={columns}
        dataSource={banners}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={uploading}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ isActive: true, sortOrder: 0 }}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入标题" />
          </Form.Item>

          <Form.Item
            name="url"
            label="链接地址"
            rules={[{ required: true, message: '请输入链接地址' }]}
          >
            <Input placeholder="请输入链接地址" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: false, message: '请输入描述' }]}
          >
            <Input.TextArea
              placeholder="请输入描述"
              rows={3}
              showCount
              maxLength={200}
            />
          </Form.Item>

          <Form.Item
            name="imageUrl"
            label="头图"
            rules={[{ required: true, message: '请上传头图' }]}
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={beforeUpload}
              customRequest={customUpload}
              onChange={handleChange}
              maxCount={1}
            >
              {fileList.length >= 1 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>上传</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item name="isActive" label="是否启用" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item
            name="sortOrder"
            label="排序值"
            tooltip="数值越小排序越靠前"
          >
            <InputNumber min={0} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 图片预览模态框 */}
      <Modal
        open={!!previewImage}
        footer={null}
        onCancel={() => setPreviewImage(null)}
      >
        <div style={{ position: 'relative', width: '100%', height: '500px' }}>
          {previewImage && (
            <Image
              src={previewImage}
              alt="预览"
              fill
              style={{ objectFit: 'contain' }}
              sizes="100vw"
              priority
              unoptimized
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
