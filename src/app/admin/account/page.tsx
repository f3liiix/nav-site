'use client';

// 导入Ant Design的React 19兼容补丁
import '@ant-design/v5-patch-for-react-19';
import { useState, useEffect, useCallback } from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useAdminApp } from '@/components/AdminAppProvider';

const { Title, Text } = Typography;

// 管理员信息类型
interface AdminInfo {
  id: number;
  username: string;
}

// 修改密码表单类型
interface ChangePasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function AccountPage() {
  const [loading, setLoading] = useState(false);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [form] = Form.useForm();
  const { message: adminMessage } = useAdminApp();

  // 获取管理员信息
  const fetchAdminInfo = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/account');
      const data = await response.json();

      if (data.success) {
        setAdminInfo(data.data);
      } else {
        adminMessage.error(data.message || '获取账号信息失败');
      }
    } catch (error) {
      console.error('获取账号信息失败:', error);
      adminMessage.error('获取账号信息失败，请稍后重试');
    }
  }, [adminMessage]);

  // 初始加载
  useEffect(() => {
    fetchAdminInfo();
  }, [fetchAdminInfo]);

  // 修改密码
  const handleChangePassword = async (values: ChangePasswordForm) => {
    // 验证两次输入的密码是否一致
    if (values.newPassword !== values.confirmPassword) {
      adminMessage.error('两次输入的新密码不一致');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/account/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        adminMessage.success('密码修改成功');
        form.resetFields();
      } else {
        adminMessage.error(data.message || '密码修改失败');
      }
    } catch (error) {
      console.error('密码修改失败:', error);
      adminMessage.error('密码修改失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={2} style={{ marginTop: 0 }}>
        账号设置
      </Title>

      <Card title="账号信息" style={{ marginBottom: 24 }}>
        <div>
          <strong>当前用户：</strong>{' '}
          <Text strong>{adminInfo?.username || '加载中...'}</Text>
        </div>
      </Card>

      <Card title="修改密码">
        <Form form={form} layout="vertical" onFinish={handleChangePassword}>
          <Form.Item
            name="oldPassword"
            label="当前密码"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入当前密码"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度不能少于6个字符' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入新密码"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            rules={[
              { required: true, message: '请再次输入新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请再次输入新密码"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button type="primary" htmlType="submit" loading={loading}>
              修改密码
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
