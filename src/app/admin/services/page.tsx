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
  Select,
  Upload,
  Popconfirm,
  Typography,
  Flex,
  Row,
  Col,
  Tag as AntTag,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import Image from 'next/image';
import { useAdminApp } from '@/components/AdminAppProvider';
import type { SelectProps } from 'antd/es/select';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// 网站类型定义
interface Service {
  id: number;
  name: string;
  url: string;
  description: string;
  icon: string | null;
  clickCount: number;
  categoryId: number;
  categoryName?: string;
  createdAt: string;
  updatedAt: string;
  tags?: Tag[];
}

// 分类类型定义
interface Category {
  id: number;
  name: string;
}

// 标签类型定义
interface Tag {
  id: number;
  name: string;
}

// 表单值类型
interface ServiceFormValues {
  name: string;
  url: string;
  description: string;
  categoryId: number;
  icon?: string;
  tagIds?: string[];
}

// 服务表单组件
interface ServiceFormProps {
  visible: boolean;
  editingId: number | null;
  initialValues?: Partial<ServiceFormValues>;
  categories: Category[];
  tags: Tag[];
  fileList: UploadFile[];
  onSave: (values: ServiceFormValues) => void;
  onCancel: () => void;
  onUploadChange: UploadProps['onChange'];
  onPreview: (file: UploadFile) => void;
}

// 服务表单组件
const ServiceForm: React.FC<ServiceFormProps> = ({
  visible,
  initialValues,
  categories,
  tags,
  fileList,
  onSave,
  onCancel,
  onUploadChange,
  onPreview,
}) => {
  const [form] = Form.useForm<ServiceFormValues>();

  // 当初始值变化时，重置表单
  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [visible, initialValues, form]);

  // 标签选择组件
  const tagSelectProps: SelectProps = {
    mode: 'tags',
    style: { width: '100%' },
    placeholder: '请选择标签或输入新标签，按空格、逗号或顿号创建',
    showSearch: true,
    options: tags.map(tag => ({
      label: tag.name,
      value: tag.name, // 使用标签名称作为值
    })),
    filterOption: (input, option) => {
      if (!option || !option.label) return false;

      // 将输入和选项标签转换为小写字符串进行比较
      const optionLabel = String(option.label).toLowerCase();
      const inputValue = input.toLowerCase();

      // 只要标签名称包含输入的文本，就返回 true
      return optionLabel.includes(inputValue);
    },
    tokenSeparators: [',', ' ', '，', '、'], // 添加全角逗号和顿号作为分隔符
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onSave}
      preserve={false}
      initialValues={{
        name: '',
        url: '',
        description: '',
        categoryId: undefined,
        tagIds: [],
        ...initialValues,
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="网站名称"
            rules={[{ required: true, message: '请输入网站名称' }]}
          >
            <Input placeholder="请输入网站名称" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="url"
            label="网站地址"
            rules={[
              { required: true, message: '请输入网站地址' },
              { type: 'url', message: '请输入有效的URL' },
            ]}
          >
            <Input placeholder="请输入网站地址，以http://或https://开头" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="categoryId"
            label="所属分类"
            rules={[{ required: true, message: '请选择所属分类' }]}
          >
            <Select placeholder="请选择所属分类">
              {categories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="icon" label="网站图标" hidden>
            <Input />
          </Form.Item>
          <Form.Item label="网站图标">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={onUploadChange}
              onPreview={onPreview}
              beforeUpload={() => false}
              maxCount={1}
            >
              {fileList.length === 0 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="tagIds" label="标签">
        <Select {...tagSelectProps} />
      </Form.Item>

      <Form.Item
        name="description"
        label="网站描述"
        rules={[{ required: true, message: '请输入网站描述' }]}
      >
        <TextArea rows={4} placeholder="请输入网站描述" />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            取消
          </Button>
          <Button type="primary" htmlType="submit">
            保存
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formInitialValues, setFormInitialValues] = useState<
    Partial<ServiceFormValues>
  >({});
  const [searchText, setSearchText] = useState<string>('');
  const { message } = useAdminApp();

  // 获取网站列表
  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/services');
      const data = await response.json();

      if (data.success) {
        const servicesList = data.data.data.data;

        // 根据当前选中的分类ID筛选服务
        if (selectedCategoryId !== null) {
          setFilteredServices(
            servicesList.filter(
              (service: Service) => service.categoryId === selectedCategoryId
            )
          );
        } else {
          setFilteredServices(servicesList);
        }

        setServices(servicesList);
      } else {
        message.error(data.message || '获取网站列表失败');
      }
    } catch (error) {
      console.error('获取网站列表失败:', error);
      message.error('获取网站列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [message, selectedCategoryId]);

  // 获取分类列表
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();

      if (data.success) {
        setCategories(data.data);
      } else {
        message.error(data.message || '获取分类列表失败');
      }
    } catch (error) {
      console.error('获取分类列表失败:', error);
      message.error('获取分类列表失败，请稍后重试');
    }
  }, [message]);

  // 获取标签列表
  const fetchTags = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/tags');
      const data = await response.json();

      if (data.success) {
        setTags(data.data.data);
      } else {
        message.error(data.message || '获取标签列表失败');
      }
    } catch (error) {
      console.error('获取标签列表失败:', error);
      message.error('获取标签列表失败，请稍后重试');
    }
  }, [message]);

  // 初始加载
  useEffect(() => {
    fetchServices();
    fetchCategories();
    fetchTags();
  }, [fetchServices, fetchCategories, fetchTags]);

  // 监听服务数据变化，确保筛选条件正确应用
  useEffect(() => {
    let filtered = services;

    // 应用分类筛选
    if (selectedCategoryId !== null) {
      filtered = filtered.filter(
        service => service.categoryId === selectedCategoryId
      );
    }

    // 应用搜索筛选
    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(lowerSearchText)
      );
    }

    setFilteredServices(filtered);
  }, [services, selectedCategoryId, searchText]);

  // 根据分类筛选网站
  const filterServices = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setCurrentPage(1);
  };

  // 重置筛选
  const resetFilter = () => {
    setSelectedCategoryId(null);
    setSearchText('');
    setCurrentPage(1);
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  // 获取服务的标签
  const fetchServiceTags = async (serviceId: number) => {
    try {
      const response = await fetch(`/api/admin/services/${serviceId}/tags`);
      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        message.error(data.message || '获取服务标签失败');
        return [];
      }
    } catch (error) {
      console.error('获取服务标签失败:', error);
      message.error('获取服务标签失败，请稍后重试');
      return [];
    }
  };

  // 更新服务的标签
  const updateServiceTags = async (serviceId: number, tagIds: number[]) => {
    try {
      const response = await fetch(`/api/admin/services/${serviceId}/tags`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tagIds }),
      });

      const data = await response.json();

      if (!data.success) {
        message.error(data.message || '更新服务标签失败');
      }
    } catch (error) {
      console.error('更新服务标签失败:', error);
      message.error('更新服务标签失败，请稍后重试');
    }
  };

  // 添加或更新网站
  const handleSave = async (values: ServiceFormValues) => {
    try {
      // 处理图标上传
      let iconPath = values.icon;
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const formData = new FormData();
        formData.append('file', fileList[0].originFileObj);
        formData.append('type', 'service'); // 指定上传类型为服务图标

        const uploadResponse = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadResponse.json();
        if (uploadData.success) {
          iconPath = uploadData.data.path;
        } else {
          message.error(uploadData.message || '上传图标失败');
          return;
        }
      }

      // 准备请求数据
      const serviceData = {
        ...values,
        icon: iconPath,
      };

      // 获取表单中的标签名称列表
      const tagNames = values.tagIds || [];

      // 处理标签 - 检查哪些是新标签，哪些是已存在的标签
      const existingTagIds: number[] = [];
      const newTagNames: string[] = [];

      // 遍历表单中的标签名称
      for (const tagName of tagNames) {
        // 检查标签是否已存在
        const existingTag = tags.find(tag => tag.name === tagName);
        if (existingTag) {
          // 如果标签已存在，添加其ID到列表
          existingTagIds.push(existingTag.id);
        } else {
          // 如果标签不存在，添加到新标签列表
          newTagNames.push(tagName);
        }
      }

      // 创建新标签并获取它们的ID
      const newTagIds: number[] = [];
      for (const tagName of newTagNames) {
        try {
          const response = await fetch('/api/admin/tags', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: tagName }),
          });

          const data = await response.json();
          if (data.success) {
            newTagIds.push(data.data.id);
            // 添加新标签到本地状态
            setTags(prevTags => [...prevTags, data.data]);
          } else {
            message.warning(`标签 "${tagName}" 创建失败: ${data.message}`);
          }
        } catch (error) {
          console.error(`创建标签 "${tagName}" 失败:`, error);
          message.warning(`标签 "${tagName}" 创建失败，请稍后重试`);
        }
      }

      // 合并已存在的标签ID和新创建的标签ID
      const allTagIds = [...existingTagIds, ...newTagIds];

      // 从请求数据中移除tagIds，因为服务API不处理这个字段
      delete serviceData.tagIds;

      // 发送请求
      const url = editingId
        ? `/api/admin/services/${editingId}`
        : '/api/admin/services';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      const data = await response.json();

      if (data.success) {
        // 如果服务创建/更新成功，更新标签
        const serviceId = editingId || data.data.id;
        await updateServiceTags(serviceId, allTagIds);

        message.success(editingId ? '更新网站成功' : '添加网站成功');
        setModalVisible(false);
        setEditingId(null);
        setFileList([]);
        setFormInitialValues({});

        // 重新获取服务列表，筛选条件会在fetchServices中应用
        fetchServices();
      } else {
        message.error(
          data.message || (editingId ? '更新网站失败' : '添加网站失败')
        );
      }
    } catch (error) {
      console.error(editingId ? '更新网站失败:' : '添加网站失败:', error);
      message.error(
        editingId ? '更新网站失败，请稍后重试' : '添加网站失败，请稍后重试'
      );
    }
  };

  // 删除网站
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        message.success('删除网站成功');
        fetchServices();
      } else {
        message.error(data.message || '删除网站失败');
      }
    } catch (error) {
      console.error('删除网站失败:', error);
      message.error('删除网站失败，请稍后重试');
    }
  };

  // 编辑网站
  const handleEdit = async (record: Service) => {
    setEditingId(record.id);

    // 获取服务的标签
    const serviceTags = await fetchServiceTags(record.id);
    const tagNames = serviceTags.map((tag: Tag) => tag.name);

    // 设置表单初始值
    setFormInitialValues({
      name: record.name,
      url: record.url,
      description: record.description,
      categoryId: record.categoryId,
      icon: record.icon || undefined,
      tagIds: tagNames,
    });

    // 设置图标预览
    if (record.icon) {
      setFileList([
        {
          uid: '-1',
          name: 'image.png',
          status: 'done',
          url: record.icon,
        },
      ]);
    } else {
      setFileList([]);
    }

    setModalVisible(true);
  };

  // 添加网站
  const handleAdd = () => {
    setEditingId(null);
    setFileList([]);
    setFormInitialValues({});
    setModalVisible(true);
  };

  // 处理图标上传
  const handleUploadChange: UploadProps['onChange'] = ({
    fileList: newFileList,
  }) => {
    setFileList(newFileList);
  };

  // 预览图标
  const handlePreview = async (file: UploadFile) => {
    if (file.url) {
      setPreviewImage(file.url);
    }
  };

  // 处理分页变化
  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) {
      setPageSize(size);
    }
  };

  // 处理每页条数变化
  const handlePageSizeChange = (current: number, size: number) => {
    setPageSize(size);
    setCurrentPage(current);
  };

  // 表格列定义
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      width: 60,
      render: (icon: string | null) =>
        icon ? (
          <div
            style={{
              position: 'relative',
              width: 40,
              height: 40,
              cursor: 'pointer',
            }}
          >
            <Image
              src={icon}
              alt="网站图标"
              fill
              style={{ objectFit: 'contain' }}
              onClick={() => setPreviewImage(icon)}
              unoptimized
            />
          </div>
        ) : (
          <Flex
            style={{
              width: 40,
              height: 40,
              background: '#f5f5f5',
              borderRadius: 4,
            }}
            justify="center"
            align="center"
          >
            无
          </Flex>
        ),
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Service, b: Service) => a.name.localeCompare(b.name),
    },
    {
      title: '分类',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 120,
      sorter: (a: Service, b: Service) =>
        a.categoryName?.localeCompare(b.categoryName || '') || 0,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 240,
      render: (_: unknown, record: Service) => {
        // 获取服务的标签
        const serviceTags = record.tags || [];
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {serviceTags.map((tag: Tag) => (
              <AntTag key={tag.id}>{tag.name}</AntTag>
            ))}
          </div>
        );
      },
    },
    {
      title: '点击量',
      dataIndex: 'clickCount',
      key: 'clickCount',
      width: 100,
      sorter: (a: Service, b: Service) => a.clickCount - b.clickCount,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: Service) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => window.open(record.url, '_blank')}
            title="访问"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="编辑"
          />
          <Popconfirm
            title="确定要删除这个网站吗?"
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
          网站管理
        </Title>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchServices()}
            loading={loading}
          >
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加网站
          </Button>
        </Space>
      </Flex>

      <div style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={16}>
            <Space wrap>
              <Button
                type={selectedCategoryId === null ? 'primary' : 'default'}
                onClick={resetFilter}
              >
                全部
              </Button>
              {categories.map(category => (
                <Button
                  key={category.id}
                  type={
                    selectedCategoryId === category.id ? 'primary' : 'default'
                  }
                  onClick={() => filterServices(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </Space>
          </Col>
          <Col span={8}>
            <Input.Search
              placeholder="搜索网站名称"
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>
      </div>

      <Table
        columns={columns}
        dataSource={filteredServices}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          onChange: handlePageChange,
          onShowSizeChange: handlePageSizeChange,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: total => `共 ${total} 条`,
        }}
      />

      <Modal
        title={editingId ? '编辑网站' : '添加网站'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
        destroyOnClose={true}
      >
        {modalVisible && (
          <ServiceForm
            visible={modalVisible}
            editingId={editingId}
            initialValues={formInitialValues}
            categories={categories}
            tags={tags}
            fileList={fileList}
            onSave={handleSave}
            onCancel={() => setModalVisible(false)}
            onUploadChange={handleUploadChange}
            onPreview={handlePreview}
          />
        )}
      </Modal>

      {previewImage && (
        <Modal
          open={!!previewImage}
          footer={null}
          onCancel={() => setPreviewImage(null)}
          title="图标预览"
        >
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Spin />
          </div>
        </Modal>
      )}
    </div>
  );
}
