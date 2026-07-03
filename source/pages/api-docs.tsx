import '../components/page.css';

import React from 'react';
import { Card, Table, Tag, Typography } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

import { PageHeader } from '../components/PageHeader';

const { Paragraph, Text, Title } = Typography;

const LS_API_BASE = 'http://jslsyz.cn/ls/v1';
const LS_CHAT_ENDPOINT = `${LS_API_BASE}/chat/completions`;

function copyText(text: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
}

export default function ApiDocsPage() {
  const credentialColumns = [
    {
      title: '名称',
      dataIndex: 'name',
      width: 120,
    },
    {
      title: '说明',
      dataIndex: 'description',
    },
    {
      title: '示例',
      dataIndex: 'sample',
      width: 220,
      render: (value: string) => (
        <Text code className="api-key-code">{value}</Text>
      ),
    },
  ];

  const credentialRows = [
    { key: '1', name: 'API Key', description: '应用密钥（仅在创建时可见，请及时复制并妥善保存，丢失需重新创建）', sample: 'sk-xxxxxxxxxxxxxxxx' },
    { key: '2', name: 'API Base URL', description: '请求端点地址', sample: LS_API_BASE },
    { key: '3', name: '对话接口', description: 'OpenAI 兼容对话补全', sample: LS_CHAT_ENDPOINT },
  ];

  const modelColumns = [
    {
      title: '模型名称',
      dataIndex: 'name',
      width: 180,
      render: (value: string) => (
        <Text copyable className="api-key-code">{value}</Text>
      ),
    },
    {
      title: 'API 格式',
      dataIndex: 'format',
      width: 140,
      render: (value: string) => <Tag color="processing">{value}</Tag>,
    },
    {
      title: '描述',
      dataIndex: 'description',
    },
  ];

  const modelRows = [
    { key: '1', name: 'lingshu-2.0', format: 'OpenAI', description: '高性能大模型，支持对话补全' },
  ];

  const limitColumns = [
    {
      title: '维度',
      dataIndex: 'dimension',
      width: 160,
    },
    {
      title: '限制',
      dataIndex: 'limit',
    },
  ];

  const limitRows = [
    { key: '1', dimension: '最大上下文窗口', limit: '1M Tokens' },
    { key: '2', dimension: '最大输出长度', limit: '128K Tokens' },
  ];

  return (
    <div className="saas-page">
      <PageHeader
        title="接口文档"
        description="欢迎使用灵数 API 开放平台，本文档将帮助您快速上手，开始使用我们的大模型服务。"
      />

      <Card bordered={false} className="page-card api-docs-section-card" style={{ marginBottom: 16 }}>
        <Title level={5} style={{ marginTop: 0 }}>如何获取 API Key？</Title>
        <Paragraph style={{ marginBottom: 8 }}>
          <strong>注册账户：</strong>
        </Paragraph>
        <Paragraph style={{ marginLeft: 20, marginBottom: 4 }}>
          1. 访问灵数 API 开放平台
        </Paragraph>
        <Paragraph style={{ marginLeft: 20, marginBottom: 12 }}>
          2. 填写必要信息完成账户注册
        </Paragraph>
        <Paragraph style={{ marginBottom: 8 }}>
          <strong>获取密钥：</strong>
        </Paragraph>
        <Paragraph style={{ marginLeft: 20, marginBottom: 12 }}>
          创建成功后，可在列表中查看。API Key 仅在创建时可见，请及时复制并妥善保存，丢失需重新创建。
        </Paragraph>
        <Table
          rowKey="key"
          columns={credentialColumns}
          dataSource={credentialRows}
          pagination={false}
          size="middle"
          className="api-docs-table"
        />
      </Card>

      <Card bordered={false} className="page-card api-docs-section-card" style={{ marginBottom: 16 }}>
        <Title level={5} style={{ marginTop: 0 }}>支持的接口类型</Title>
        <Paragraph>
          灵数 API 开放平台兼容 OpenAI API 格式，您可以根据需要选择使用。
        </Paragraph>
        <Paragraph style={{ marginBottom: 4 }}>
          <strong>OpenAI API 格式</strong>
        </Paragraph>
        <Paragraph style={{ marginLeft: 20, marginBottom: 12 }}>
          完全兼容 OpenAI API 规范，支持对话补全接口 <Text code>{LS_CHAT_ENDPOINT}</Text>。
        </Paragraph>
        <Paragraph style={{ marginBottom: 8 }}>
          <strong>支持的模型</strong>
        </Paragraph>
        <Table
          rowKey="key"
          columns={modelColumns}
          dataSource={modelRows}
          pagination={false}
          size="middle"
          className="api-docs-table"
        />
      </Card>

      <Card bordered={false} className="page-card api-docs-section-card" style={{ marginBottom: 16 }}>
        <Title level={5} style={{ marginTop: 0 }}>限流规则</Title>
        <Paragraph style={{ marginBottom: 8 }}>单次请求限制：</Paragraph>
        <Table
          rowKey="key"
          columns={limitColumns}
          dataSource={limitRows}
          pagination={false}
          size="middle"
          className="api-docs-table"
        />
        <Paragraph style={{ marginTop: 12, marginBottom: 0 }}>
          当触发限流时，API 将返回 HTTP 状态码 429，建议在客户端实现指数退避重试机制。
        </Paragraph>
      </Card>

      <Card bordered={false} className="page-card api-docs-section-card" style={{ marginBottom: 16 }}>
        <Title level={5} style={{ marginTop: 0 }}>快速接入示例</Title>
        <Paragraph style={{ marginBottom: 4 }}>
          <strong>使用 OpenAI SDK（Python）</strong>
        </Paragraph>
        <Card size="small" className="api-docs-code-card">
          <pre className="api-docs-code">
{`from openai import OpenAI

client = OpenAI(
    api_key="YOUR_APP_KEY",
    base_url="${LS_API_BASE}"
)

response = client.chat.completions.create(
    model="lingshu-2.0",
    messages=[
        {"role": "user", "content": "Hello!"}
    ],
    max_tokens=1000
)

print(response.choices[0].message.content)`}
          </pre>
        </Card>

        <Paragraph style={{ marginBottom: 4, marginTop: 16 }}>
          <strong>cURL 示例</strong>
        </Paragraph>
        <Card size="small" className="api-docs-code-card">
          <pre className="api-docs-code">
{`curl -X POST ${LS_CHAT_ENDPOINT} \\
  -H "Authorization: Bearer YOUR_APP_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "lingshu-2.0",
    "messages": [{"role": "user", "content": "Hello!"}],
    "max_tokens": 1000
  }'`}
          </pre>
        </Card>

        <Paragraph style={{ marginBottom: 4, marginTop: 16 }}>
          <strong>原生 Python 请求</strong>
        </Paragraph>
        <Card size="small" className="api-docs-code-card">
          <pre className="api-docs-code">
{`import requests

url = "${LS_CHAT_ENDPOINT}"
headers = {
    "Authorization": "Bearer YOUR_APP_KEY",
    "Content-Type": "application/json"
}

data = {
    "model": "lingshu-2.0",
    "messages": [
        {"role": "user", "content": "你好，请介绍一下自己"}
    ],
    "max_tokens": 1000,
    "temperature": 0.7
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`}
          </pre>
        </Card>
      </Card>

      <Card bordered={false} className="page-card api-docs-section-card api-docs-reminder-card">
        <Title level={5} style={{ marginTop: 0 }}>重要提醒</Title>
        <Paragraph style={{ marginBottom: 0 }}>
          请妥善保管您的 API Key，避免泄露造成额度被盗用。
        </Paragraph>
      </Card>
    </div>
  );
}
