import '../components/page.css';

import React from 'react';
import { Card, Table, Tag, Typography } from 'antd';

import { PageHeader } from '../components/PageHeader';
import { EXAMPLE_MODEL, LS_API_BASE, LS_CHAT_ENDPOINT } from '../components/apiDocShared';

const { Paragraph, Text, Title } = Typography;

export default function ApiDocsPage() {
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
    { key: '1', name: 'gpt-4o', format: 'OpenAI', description: '旗舰多模态对话模型（示例）' },
    { key: '2', name: 'gpt-4o-mini', format: 'OpenAI', description: '高性价比对话模型（示例）' },
    { key: '3', name: 'claude-3-5-sonnet', format: 'OpenAI', description: '长文本与推理场景（示例）' },
  ];

  const limitColumns = [
    {
      title: '维度',
      dataIndex: 'dimension',
      width: 160,
    },
    {
      title: '说明',
      dataIndex: 'description',
    },
  ];

  const limitRows = [
    {
      key: '1',
      dimension: '单次请求',
      description: '默认遵循各模型自身的上下文与输出上限，具体以接口调用时的实际约束为准。',
    },
    {
      key: '2',
      dimension: '调用频率',
      description: '默认遵循各模型及上游渠道的 RPM、TPM 等限流策略，不同模型可能有所不同。',
    },
  ];

  return (
    <div className="saas-page">
      <PageHeader
        title="接口文档"
        description="介绍灵数 API 开放平台支持的接口类型、限流规则与 OpenAI 兼容调用示例。"
      />

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
          <strong>支持的模型（示例）</strong>
        </Paragraph>
        <Paragraph type="secondary" style={{ marginBottom: 12 }}>
          下表仅为常见示例；您实际可调用的模型以密钥详情中的「允许模型」及「模型广场」公示为准。
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
        <Paragraph style={{ marginBottom: 8 }}>
          平台默认根据各模型自身规格执行限流，不同模型的单次请求约束与调用频率可能不同。
        </Paragraph>
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
        <Paragraph type="secondary" style={{ marginBottom: 12 }}>
          请将 <Text code>YOUR_APP_KEY</Text> 替换为「企业密钥」详情中复制的系统密钥，将 model 替换为当前密钥允许的模型名称。
        </Paragraph>
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
    model="${EXAMPLE_MODEL}",
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
    "model": "${EXAMPLE_MODEL}",
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
    "model": "${EXAMPLE_MODEL}",
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
    </div>
  );
}
