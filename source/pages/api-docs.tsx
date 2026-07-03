import '../components/page.css';

import React from 'react';
import { Card, Steps, Table, Tag, Typography } from 'antd';

import { PageHeader } from '../components/PageHeader';
import { DEFAULT_SYSTEM_API_BASE_URL } from '../components/mockData';

const { Paragraph, Text, Title } = Typography;

const LS_API_BASE = DEFAULT_SYSTEM_API_BASE_URL;
const LS_CHAT_ENDPOINT = `${LS_API_BASE}/chat/completions`;
const EXAMPLE_MODEL = 'gpt-4o';

export default function ApiDocsPage() {
  const credentialColumns = [
    {
      title: '名称',
      dataIndex: 'name',
      width: 130,
      onHeaderCell: () => ({ className: 'api-docs-credential-col-name' }),
      onCell: () => ({ className: 'api-docs-credential-col-name' }),
    },
    {
      title: '说明',
      dataIndex: 'description',
      onHeaderCell: () => ({ className: 'api-docs-credential-col-desc' }),
      onCell: () => ({ className: 'api-docs-credential-col-desc' }),
      render: (value: string) => (
        <span className="api-docs-credential-desc">{value}</span>
      ),
    },
    {
      title: '示例',
      dataIndex: 'sample',
      onHeaderCell: () => ({ className: 'api-docs-credential-col-sample' }),
      onCell: () => ({ className: 'api-docs-credential-col-sample' }),
      render: (value: string) => (
        <Text code className="api-key-code api-docs-credential-sample">{value}</Text>
      ),
    },
  ];

  const credentialRows = [
    {
      key: '1',
      name: 'API Key',
      description: '系统密钥：在「企业密钥」列表或详情中复制完整密钥（列表脱敏展示）。自建密钥：创建时填写的上游 API Key，可在详情中复制。',
      sample: 'sk-ls-prod-xxxx…',
    },
    {
      key: '2',
      name: 'API Base URL',
      description: '系统密钥：在密钥详情「API 地址」查看平台分配的网关地址。自建密钥：创建时填写的 OpenAI 兼容 Base URL。',
      sample: LS_API_BASE,
    },
    {
      key: '3',
      name: '对话接口',
      description: '在 Base URL 后追加 /chat/completions，采用 OpenAI 兼容对话补全协议。',
      sample: LS_CHAT_ENDPOINT,
    },
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
        description="欢迎使用灵数 API 开放平台。本文说明如何在本工作台获取密钥，并以 OpenAI 兼容方式调用大模型服务。"
      />

      <Card bordered={false} className="page-card api-docs-section-card" style={{ marginBottom: 16 }}>
        <Title level={5} style={{ marginTop: 0 }}>如何获取 API Key？</Title>
        <Paragraph>
          本平台不向个人开放自助注册密钥。企业须先完成 <Text strong>接入申请与账号开通</Text>，登录工作台后，在侧栏
          <Text strong> 企业密钥 </Text>
          中获取或登记密钥。密钥分为 <Tag bordered={false} color="processing">系统</Tag> 与
          <Tag bordered={false} color="gold">自建</Tag> 两类，用途不同。
        </Paragraph>

        <Paragraph style={{ marginBottom: 8 }}>
          <Text strong>第一步：开通企业账号</Text>
        </Paragraph>
        <Steps
          direction="vertical"
          size="small"
          className="api-docs-steps"
          current={-1}
          items={[
            {
              title: '新企业提交接入申请',
              description: '登录页点击「提交接入申请」，填写企业信息并提交；等待平台审核。',
            },
            {
              title: '平台审核并开通账号',
              description: '审核通过后，平台将为您开通企业管理员账号。',
            },
            {
              title: '企业登录工作台',
              description: '使用平台发放的账号密码登录；首次登录将自动同步租户与用户数据。',
            },
          ]}
        />

        <Paragraph style={{ marginTop: 20, marginBottom: 8 }}>
          <Text strong>第二步：获取系统密钥（调用灵数 API 网关）</Text>
        </Paragraph>
        <Paragraph type="secondary" style={{ marginBottom: 12 }}>
          系统密钥由灵数平台统一分配，通过「接口调用获取密钥」同步至本工作台，用于调用灵数统一网关。
        </Paragraph>
        <Steps
          direction="vertical"
          size="small"
          className="api-docs-steps"
          current={-1}
          items={[
            {
              title: '进入「企业密钥」',
              description: '登录后从侧栏功能菜单进入企业密钥页面。',
            },
            {
              title: '点击「接口调用获取密钥」',
              description: '从平台增量同步最新系统密钥，拉取本企业尚未持有的记录；已存在密钥不会被覆盖。',
            },
            {
              title: '查看并复制凭证',
              description: '在列表确认密钥来源为「系统」、企业侧状态为「已启用」；点击「详情」查看 API 地址，使用复制按钮获取完整 API 密钥。',
            },
            {
              title: '确认可用模型',
              description: '在详情「允许模型」或侧栏「模型广场」查看当前密钥可调用的模型名称；调用时 model 参数须在此范围内。',
            },
          ]}
        />
        <Paragraph style={{ marginTop: 12, marginBottom: 0 }} type="secondary">
          调用前请确保密钥处于可用状态：本企业已启用、平台侧状态正常、额度未耗尽等。可在密钥列表通过「更多 → 测试」进行连通性验证。
        </Paragraph>

        <Paragraph style={{ marginTop: 20, marginBottom: 8 }}>
          <Text strong>第三步（可选）：登记自建密钥</Text>
        </Paragraph>
        <Paragraph type="secondary" style={{ marginBottom: 12 }}>
          若需将企业自有 OpenAI 兼容网关登记到平台，供系统内部应用统一调用，可使用自建密钥（不计入平台 Token 消费账单）。
        </Paragraph>
        <Steps
          direction="vertical"
          size="small"
          className="api-docs-steps"
          current={-1}
          items={[
            {
              title: '点击「自建密钥」',
              description: '填写密钥名称、API 地址、API Key、模型名称（可多个）及描述。',
            },
            {
              title: '创建后在详情查看',
              description: '创建成功自动打开详情抽屉，可在此复制 API 地址与密钥；后续可通过「编辑」维护配置。',
            },
          ]}
        />

        <Title level={5} style={{ marginTop: 24 }}>凭证说明</Title>
        <Table
          rowKey="key"
          columns={credentialColumns}
          dataSource={credentialRows}
          pagination={false}
          size="middle"
          scroll={{ x: 'max-content' }}
          className="api-docs-table api-docs-credential-table"
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

      <Card bordered={false} className="page-card api-docs-section-card api-docs-reminder-card">
        <Title level={5} style={{ marginTop: 0 }}>重要提醒</Title>
        <Paragraph style={{ marginBottom: 8 }}>
          请妥善保管 API Key，避免泄露造成额度被盗用；系统密钥请勿写入前端代码或公开仓库。
        </Paragraph>
        <Paragraph style={{ marginBottom: 0 }}>
          密钥列表支持随时复制完整密钥；若平台已收回某系统密钥，请再次点击「接口调用获取密钥」同步并确认删除提示。
        </Paragraph>
      </Card>
    </div>
  );
}
