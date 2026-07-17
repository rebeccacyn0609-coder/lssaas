import '../components/page.css';

import React, { useState } from 'react';
import { Button, Form, Input, Typography, message } from 'antd';
import {
  ApiOutlined,
  BarChartOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';

import { DEMO_ACCOUNT, setSession } from '../components/mockData';
import { AuthBackdrop } from '../components/AuthBackdrop';

const { Title, Text, Link } = Typography;

const FEATURES = [
  {
    icon: <ApiOutlined />,
    title: '统一 API 接入',
    desc: '多模型一站式调用',
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: '企业密钥管控',
    desc: '配额与权限可追溯',
  },
  {
    icon: <BarChartOutlined />,
    title: '用量费用透明',
    desc: '看板账单一目了然',
  },
] as const;

interface LoginPageProps {
  onLoginSuccess: () => void;
  onGoApply: () => void;
}

export default function LoginPage({ onLoginSuccess, onGoApply }: LoginPageProps) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleFinish = (values: { username: string; password: string }) => {
    setLoading(true);
    window.setTimeout(() => {
      if (
        values.username === DEMO_ACCOUNT.username
        && values.password === DEMO_ACCOUNT.password
      ) {
        setSession(DEMO_ACCOUNT.companyName);
        message.success('登录成功');
        onLoginSuccess();
      } else {
        message.error(`账号或密码错误，演示账号：${DEMO_ACCOUNT.username}`);
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="auth-page auth-page--stage">
      <AuthBackdrop immersive />

      <main className="auth-stage">
        <div className="auth-stage-card">
          <aside className="auth-stage-intro" aria-label="平台介绍">
            <p className="auth-stage-eyebrow">LingShu API Platform</p>

            <header className="auth-stage-brand">
              <div className="auth-stage-logo">灵</div>
              <div>
                <Title level={2} className="auth-stage-title">灵数 API 开放平台</Title>
                <Text className="auth-stage-tagline">企业级大模型 API 接入与管理</Text>
              </div>
            </header>

            <ul className="auth-stage-features">
              {FEATURES.map((item) => (
                <li key={item.title} className="auth-stage-features__item">
                  <span className="auth-stage-features__icon" aria-hidden>{item.icon}</span>
                  <span className="auth-stage-features__copy">
                    <strong>{item.title}</strong>
                    <em>{item.desc}</em>
                  </span>
                </li>
              ))}
            </ul>
          </aside>

          <div className="auth-stage-split" role="separator" />

          <section className="auth-stage-login" aria-label="企业登录">
            <header className="auth-stage-login__head">
              <Title level={4} className="auth-stage-login__title">企业登录</Title>
              <Text className="auth-stage-login__desc">
                已开通账号的企业请登录；新企业可提交接入申请
              </Text>
            </header>

            <Form
              form={form}
              layout="vertical"
              className="auth-form auth-form--login auth-stage-form"
              onFinish={handleFinish}
              initialValues={{ username: DEMO_ACCOUNT.username }}
            >
              <Form.Item
                name="username"
                label="账号"
                rules={[{ required: true, message: '请输入企业账号' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="企业账号" size="large" />
              </Form.Item>
              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
              </Form.Item>
              <Form.Item className="auth-login-submit-item">
                <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                  登录
                </Button>
              </Form.Item>
            </Form>

            <div className="auth-stage-footer">
              <Text type="secondary">还没有企业账号？</Text>
              <Link onClick={onGoApply}>提交接入申请</Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
