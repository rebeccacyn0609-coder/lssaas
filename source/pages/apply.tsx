import '../components/page.css';

import React, { useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Result,
  Steps,
  Typography,
  message,
} from 'antd';
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons';

import { saveApplyRecord, type EnterpriseApplyForm } from '../components/mockData';
import { AuthBackdrop } from '../components/AuthBackdrop';

const { Title, Text, Link, Paragraph } = Typography;
const { TextArea } = Input;

interface ApplyPageProps {
  onBackLogin: () => void;
  onSubmitted: () => void;
}

export default function ApplyPage({ onBackLogin, onSubmitted }: ApplyPageProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form] = Form.useForm();

  const handleFinish = (values: EnterpriseApplyForm) => {
    setLoading(true);
    window.setTimeout(() => {
      saveApplyRecord({
        ...values,
        creditCode: values.creditCode?.trim() ?? '',
      });
      setSubmitted(true);
      setLoading(false);
      message.success('申请已提交，运营管理端将每 5 秒轮询获取申请信息');
      onSubmitted();
    }, 500);
  };

  if (submitted) {
    return (
      <div className="auth-page">
        <AuthBackdrop />
        <div className="auth-panel auth-panel--wide">
          <Card bordered={false} className="auth-card">
            <Result
              status="success"
              title="申请已提交"
              subTitle="您的企业接入申请已保存，运营管理端将轮询获取并进行后续处理。审核通过后将为您创建企业账号。"
              extra={[
                <Button type="primary" key="login" onClick={onBackLogin}>
                  返回登录
                </Button>,
              ]}
            />
            <Steps
              size="small"
              current={1}
              className="apply-steps"
              items={[
                { title: '填写申请' },
                { title: '运营审核' },
                { title: '开通账号' },
              ]}
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <AuthBackdrop />
      <div className="auth-panel auth-panel--wide">
        <div className="auth-brand-block auth-brand-block--compact">
          <div className="auth-brand-logo">灵</div>
          <div>
            <Title level={3} className="auth-brand-title">企业接入申请</Title>
            <Text type="secondary">新企业初次访问需填写申请信息，提交后由运营端处理</Text>
          </div>
        </div>

        <Card bordered={false} className="auth-card">
          <div className="apply-card-head">
            <Link onClick={onBackLogin} className="apply-back-link">
              <ArrowLeftOutlined /> 返回登录
            </Link>
          </div>

          <Form
            form={form}
            layout="vertical"
            className="apply-form"
            onFinish={handleFinish}
          >
            <div className="apply-form-grid">
              <Form.Item
                name="companyName"
                label="企业名称"
                rules={[{ required: true, message: '请输入企业名称' }]}
              >
                <Input placeholder="与营业执照一致" />
              </Form.Item>
              <Form.Item
                name="creditCode"
                label="统一社会信用代码"
              >
                <Input placeholder="选填，18 位信用代码" />
              </Form.Item>
              <Form.Item
                name="contactName"
                label="联系人"
                rules={[{ required: true, message: '请输入联系人' }]}
              >
                <Input placeholder="业务对接人" />
              </Form.Item>
              <Form.Item
                name="contactPhone"
                label="联系电话"
                rules={[
                  { required: true, message: '请输入联系电话' },
                  { pattern: /^1\d{10}$/, message: '请输入有效手机号' },
                ]}
              >
                <Input placeholder="11 位手机号" />
              </Form.Item>
              <Form.Item
                name="contactEmail"
                label="联系邮箱"
                className="apply-form-span-2"
                rules={[
                  { required: true, message: '请输入联系邮箱' },
                  { type: 'email', message: '请输入有效邮箱' },
                ]}
              >
                <Input placeholder="用于接收审核通知" />
              </Form.Item>
              <Form.Item
                name="usageScene"
                label="使用场景说明"
                className="apply-form-span-2"
                rules={[{ required: true, message: '请描述预计使用场景' }]}
              >
                <TextArea rows={4} placeholder="例如：智能客服、知识库问答、代码辅助等" maxLength={500} showCount />
              </Form.Item>
            </div>

            <Paragraph type="secondary" className="apply-hint">
              提交后申请信息将保留，运营管理端每 5 秒轮询主动获取；SaaS 管理端支持列表展示与后续处理。
            </Paragraph>

            <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={loading} size="large">
              提交申请
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
}
