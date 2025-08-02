'use client';

// 导入Ant Design的React 19兼容补丁
import '@ant-design/v5-patch-for-react-19';
import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Row, Col, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { useAdminApp } from '@/components/AdminAppProvider';

const { Title } = Typography;

interface LoginFormData {
  username: string;
  password: string;
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const { message } = useAdminApp();

  // 登录成功后强制跳转
  useEffect(() => {
    if (loginSuccess) {
      message.success('登录成功，正在跳转...');
      // 使用setTimeout确保消息显示后再跳转
      const timer = setTimeout(() => {
        // 使用硬跳转确保页面完全刷新，避免客户端路由问题
        window.location.href = '/admin';
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loginSuccess, message]);

  const handleLogin = async (values: LoginFormData) => {
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
        credentials: 'include', // 确保包含Cookie
      });

      const data = await response.json();

      if (data.success) {
        // 登录成功，设置状态触发跳转
        setLoginSuccess(true);
      } else {
        message.error(data.message || '登录失败');
      }
    } catch (error) {
      console.error('登录请求失败:', error);
      message.error('登录请求失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 自定义卡片标题，包含Logo和文字
  const cardTitle = (
    <Space
      align="center"
      style={{ display: 'flex', justifyContent: 'center', margin: '15px 0' }}
    >
      <div style={{ position: 'relative', width: '36px', height: '36px' }}>
        <Image
          src="/logo.svg"
          alt="网站Logo"
          fill
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>
      <Title level={4} style={{ margin: 0 }}>
        管理员登录
      </Title>
    </Space>
  );

  return (
    <Row
      justify="center"
      align="middle"
      style={{
        minHeight: '100vh',
        background: '#f0f2f5',
      }}
    >
      <Col xs={22} sm={16} md={12} lg={8} xl={6}>
        <Card
          title={cardTitle}
          style={{
            boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.03)',
          }}
        >
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={handleLogin}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="用户名" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="密码" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" loading={loading} block>
                登录
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}
