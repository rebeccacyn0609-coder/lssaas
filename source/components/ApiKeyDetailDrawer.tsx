import './page.css';

import React from 'react';
import { Button, Descriptions, Drawer, Space, Tag, Tooltip, message } from 'antd';
import { CopyOutlined, EditOutlined } from '@ant-design/icons';

import {
  API_KEY_SOURCE_LABELS,
  getApiKeyDisplayModels,
  getSelfKeyModelNames,
  maskApiKey,
  type ApiKeyRow,
  type ApiKeySource,
  type KeyStatus,
} from './mockData';

const statusLabel: Record<KeyStatus, string> = {
  enabled: '已启用',
  disabled: '已禁用',
};

const sourceTagColor: Record<ApiKeySource, string> = {
  system: 'blue',
  self: 'gold',
};

async function copyText(text: string, successMessage = '已复制') {
  try {
    await navigator.clipboard.writeText(text);
    message.success(successMessage);
  } catch {
    message.error('复制失败，请手动复制');
  }
}

function renderSystemAllowedModels(record: ApiKeyRow) {
  const { models } = getApiKeyDisplayModels(record);
  if (!models.length) return '—';
  return (
    <Space size={[8, 8]} wrap className="model-tag-group api-key-detail-model-list">
      {models.map((model) => (
        <span key={model} className="api-key-detail-model-item">
          <Tag className="model-tag">{model}</Tag>
          <Tooltip title="复制模型名称">
            <Button
              type="text"
              size="small"
              className="api-key-detail-model-copy"
              icon={<CopyOutlined />}
              onClick={() => copyText(model, `已复制模型：${model}`)}
            />
          </Tooltip>
        </span>
      ))}
    </Space>
  );
}

function renderIpWhitelist(record: ApiKeyRow) {
  const value = record.ipWhitelist?.trim();
  if (!value) return '—';
  return <span className="api-key-detail-multiline">{value.split(/\s+/).join('\n')}</span>;
}

export function ApiKeyDetailDrawer({
  record,
  open,
  onClose,
  onEdit,
}: {
  record: ApiKeyRow | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (record: ApiKeyRow) => void;
}) {
  const isSystem = record?.source === 'system';
  const isSelf = record?.source === 'self';

  return (
    <Drawer
      title={record ? `${record.name} · 密钥详情` : '密钥详情'}
      open={open}
      onClose={onClose}
      width={560}
      destroyOnClose
      className="api-key-detail-drawer"
      footer={
        isSelf && record && onEdit ? (
          <div className="api-key-detail-drawer-footer">
            <Button type="primary" icon={<EditOutlined />} onClick={() => onEdit(record)}>
              编辑
            </Button>
          </div>
        ) : null
      }
    >
      {record ? (
        <Descriptions column={1} size="small" bordered className="api-key-detail-desc">
          <Descriptions.Item label="密钥名称">{record.name}</Descriptions.Item>
          {isSystem && record.apiBaseUrl ? (
            <Descriptions.Item label="API 地址">
              <Space>
                <code className="key-code key-code--url">{record.apiBaseUrl}</code>
                <Tooltip title="复制 API 地址">
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => copyText(record.apiBaseUrl!, 'API 地址已复制')}
                  />
                </Tooltip>
              </Space>
            </Descriptions.Item>
          ) : null}
          {isSelf && record.apiBaseUrl ? (
            <Descriptions.Item label="API 地址">
              <Space>
                <code className="key-code key-code--url">{record.apiBaseUrl}</code>
                <Tooltip title="复制 API 地址">
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => copyText(record.apiBaseUrl!, 'API 地址已复制')}
                  />
                </Tooltip>
              </Space>
            </Descriptions.Item>
          ) : null}
          <Descriptions.Item label="API 密钥">
            <Space>
              <code className="key-code">{maskApiKey(record.key)}</code>
              <Tooltip title="复制完整密钥">
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => copyText(record.key, '密钥已复制')}
                />
              </Tooltip>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="密钥来源">
            <Tag color={sourceTagColor[record.source]} bordered={false}>
              {API_KEY_SOURCE_LABELS[record.source]}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={record.status === 'enabled' ? 'success' : 'default'}>
              {statusLabel[record.status]}
            </Tag>
          </Descriptions.Item>
          {isSelf ? (
            <Descriptions.Item label="模型名称">
              {getSelfKeyModelNames(record).length ? (
                <Space size={[8, 8]} wrap className="model-tag-group api-key-detail-model-list">
                  {getSelfKeyModelNames(record).map((model) => (
                    <span key={model} className="api-key-detail-model-item">
                      <Tag className="model-tag">{model}</Tag>
                      <Tooltip title="复制模型名称">
                        <Button
                          type="text"
                          size="small"
                          className="api-key-detail-model-copy"
                          icon={<CopyOutlined />}
                          onClick={() => copyText(model, `已复制模型：${model}`)}
                        />
                      </Tooltip>
                    </span>
                  ))}
                </Space>
              ) : (
                '—'
              )}
            </Descriptions.Item>
          ) : (
            <>
              <Descriptions.Item label="允许模型/模型名称">
                {renderSystemAllowedModels(record)}
              </Descriptions.Item>
              <Descriptions.Item label="IP 白名单">{renderIpWhitelist(record)}</Descriptions.Item>
            </>
          )}
          <Descriptions.Item label="创建时间">{record.createdAt}</Descriptions.Item>
          <Descriptions.Item label="最近使用">{record.lastUsedAt || '—'}</Descriptions.Item>
          <Descriptions.Item label="描述">{record.remark || '—'}</Descriptions.Item>
        </Descriptions>
      ) : null}
    </Drawer>
  );
}
