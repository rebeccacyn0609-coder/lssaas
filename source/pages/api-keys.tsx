import '../components/page.css';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Drawer,
  Dropdown,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  message,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  CheckCircleOutlined,
  CloudDownloadOutlined,
  CloudOutlined,
  CopyOutlined,
  EditOutlined,
  FileSearchOutlined,
  InfoCircleOutlined,
  KeyOutlined,
  MoreOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  ThunderboltOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import { PageHeader } from '../components/PageHeader';
import { ApiKeyDetailDrawer } from '../components/ApiKeyDetailDrawer';
import { ApiKeyTestModal } from '../components/ApiKeyTestModal';
import { SelfApiKeyModal } from '../components/SelfApiKeyModal';
import { UsageLogPanel } from '../components/UsageLogPanel';
import {
  applyApiKeySyncFromAdmin,
  createSelfBuiltApiKey,
  fetchApiKeys,
  previewApiKeySyncFromAdmin,
  toggleApiKeyStatus,
  updateSelfBuiltApiKey,
  type ApiKeyQuery,
  type ApiKeyListSummary,
  type SelfApiKeyFormPayload,
} from '../components/services';
import {
  API_KEY_SOURCE_LABELS,
  getApiKeyDisplayModels,
  getSelfKeyModelNames,
  maskApiKey,
  type ApiKeyRow,
  type ApiKeySource,
  type KeyStatus,
} from '../components/mockData';

const statusLabel: Record<KeyStatus, string> = {
  enabled: '已启用',
  disabled: '已禁用',
};

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    message.success('密钥已复制');
  } catch {
    message.error('复制失败，请手动复制');
  }
}

function TruncatedTooltip({
  title,
  children,
  multiline = false,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  multiline?: boolean;
}) {
  if (title == null || title === '' || title === '—') {
    return <>{children}</>;
  }

  return (
    <Tooltip
      title={title}
      overlayInnerStyle={multiline ? { whiteSpace: 'pre-line', maxWidth: 400 } : { maxWidth: 400 }}
    >
      <span className="api-key-cell-ellipsis">{children}</span>
    </Tooltip>
  );
}

function renderModelTags(models: string[]) {
  if (!models.length) return '—';
  if (models.length === 1) {
    return (
      <TruncatedTooltip title={models[0]}>
        <Tag className="model-tag">{models[0]}</Tag>
      </TruncatedTooltip>
    );
  }
  const visible = models.slice(0, 2);
  const rest = models.length - visible.length;
  const tooltipTitle = models.join('\n');
  const content = (
    <Space size={4} wrap className="model-tag-group">
      {visible.map((model) => (
        <Tag key={model} className="model-tag">
          {model}
        </Tag>
      ))}
      {rest > 0 ? <Tag className="model-tag model-tag--more">+{rest}</Tag> : null}
    </Space>
  );
  return (
    <TruncatedTooltip title={tooltipTitle} multiline>
      {content}
    </TruncatedTooltip>
  );
}

function renderAllowedModelsCell(record: ApiKeyRow) {
  if (record.source === 'self') {
    return renderModelTags(getSelfKeyModelNames(record));
  }
  const { models } = getApiKeyDisplayModels(record);
  return renderModelTags(models);
}

function ApiKeyStatsBar({ summary }: { summary: ApiKeyListSummary }) {
  const items = [
    { key: 'total', label: '密钥总数', value: summary.total, icon: <KeyOutlined />, tone: 'primary' as const },
    { key: 'enabled', label: '已启用', value: summary.enabled, icon: <CheckCircleOutlined />, tone: 'success' as const },
    { key: 'system', label: '系统密钥', value: summary.system, icon: <CloudOutlined />, tone: 'system' as const },
    { key: 'self', label: '自建密钥', value: summary.self, icon: <ToolOutlined />, tone: 'self' as const },
  ];

  return (
    <div className="api-keys-stats" aria-label="密钥概览">
      {items.map((item) => (
        <div key={item.key} className={`api-keys-stat api-keys-stat--${item.tone}`}>
          <span className="api-keys-stat-icon" aria-hidden>{item.icon}</span>
          <div className="api-keys-stat-body">
            <span className="api-keys-stat-label">{item.label}</span>
            <strong className="api-keys-stat-value">{item.value}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}

const DEFAULT_PAGE_SIZE = 10;

export default function ApiKeysPage() {
  const [form] = Form.useForm();
  const [rows, setRows] = useState<ApiKeyRow[]>([]);
  const [listSummary, setListSummary] = useState<ApiKeyListSummary>({
    total: 0,
    enabled: 0,
    system: 0,
    self: 0,
  });
  const [pagination, setPagination] = useState({ current: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [logKey, setLogKey] = useState<ApiKeyRow | null>(null);
  const [detailKey, setDetailKey] = useState<ApiKeyRow | null>(null);
  const [testKey, setTestKey] = useState<ApiKeyRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [selfKeyModalMode, setSelfKeyModalMode] = useState<'create' | 'edit'>('create');
  const [editingSelfKey, setEditingSelfKey] = useState<ApiKeyRow | null>(null);
  const [creating, setCreating] = useState(false);
  const appliedQueryRef = React.useRef<ApiKeyQuery>({});

  const loadData = useCallback(async (query: ApiKeyQuery = {}) => {
    setLoading(true);
    try {
      const result = await fetchApiKeys(query);
      setRows(result.rows);
      setListSummary(result.summary);
      setPagination({
        current: query.page ?? 1,
        pageSize: query.pageSize ?? DEFAULT_PAGE_SIZE,
        total: result.total,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const query: ApiKeyQuery = { page: 1, pageSize: DEFAULT_PAGE_SIZE };
    appliedQueryRef.current = query;
    loadData(query);
  }, [loadData]);

  const buildListQuery = useCallback((overrides: Partial<ApiKeyQuery> = {}): ApiKeyQuery => {
    const values = form.getFieldsValue();
    return {
      name: values.name,
      status: values.status || 'all',
      page: overrides.page ?? pagination.current,
      pageSize: overrides.pageSize ?? pagination.pageSize,
      ...overrides,
    };
  }, [form, pagination.current, pagination.pageSize]);

  const handleSearch = () => {
    const query: ApiKeyQuery = {
      name: form.getFieldValue('name'),
      status: form.getFieldValue('status') || 'all',
      page: 1,
      pageSize: pagination.pageSize,
    };
    appliedQueryRef.current = query;
    loadData(query);
  };

  const handleReset = () => {
    form.resetFields();
    const query: ApiKeyQuery = { page: 1, pageSize: pagination.pageSize };
    appliedQueryRef.current = query;
    loadData(query);
  };

  const handleTableChange = (page: number, pageSize: number) => {
    const query = buildListQuery({ page, pageSize });
    appliedQueryRef.current = query;
    loadData(query);
  };

  const handleSyncFromAdmin = async () => {
    setSyncing(true);
    try {
      const preview = await previewApiKeySyncFromAdmin();

      if (preview.removedCount === 0 && preview.addedCount === 0) {
        message.info('密钥已与系统管理端一致，无需更新');
        setSyncing(false);
        return;
      }

      const runApply = async () => {
        setSyncing(true);
        try {
          const result = await applyApiKeySyncFromAdmin();
          const parts: string[] = [];
          if (result.removedCount > 0) parts.push(`删除 ${result.removedCount} 条`);
          if (result.addedCount > 0) parts.push(`新增 ${result.addedCount} 条`);
          if (parts.length > 0) {
            message.success(`同步完成：${parts.join('，')}`);
          } else {
            message.info('密钥已与系统管理端一致，无需更新');
          }
          await loadData(appliedQueryRef.current);
          setDetailKey((prev) => (prev && result.removedIds.includes(prev.id) ? null : prev));
          setLogKey((prev) => (prev && result.removedIds.includes(prev.id) ? null : prev));
        } catch {
          message.error('同步失败，请稍后重试');
        } finally {
          setSyncing(false);
        }
      };

      if (preview.removedCount > 0) {
        setSyncing(false);
        const confirmContent = preview.removedCount === 1
          ? `当前密钥名称为${preview.toRemove[0].name}系统管理端已删除，此次操作将删除此密钥，请确认是否继续。`
          : (
            <div className="api-key-sync-confirm">
              <p>以下密钥在系统管理端已删除，此次操作将删除对应密钥，请确认是否继续：</p>
              <ul>
                {preview.toRemove.map((item) => (
                  <li key={item.id}>{item.name}</li>
                ))}
              </ul>
            </div>
          );

        Modal.confirm({
          title: '确认同步密钥',
          content: confirmContent,
          okText: '是',
          cancelText: '否',
          width: 480,
          onOk: () => runApply(),
        });
        return;
      }

      await runApply();
    } catch {
      message.error('获取失败，请稍后重试');
      setSyncing(false);
    }
  };

  const handleSetStatus = useCallback(async (record: ApiKeyRow, nextStatus: KeyStatus) => {
    if (record.status === nextStatus) return;
    setTogglingId(record.id);
    try {
      await toggleApiKeyStatus(record.id, nextStatus);
      setRows((prev) =>
        prev.map((row) => (row.id === record.id ? { ...row, status: nextStatus } : row)),
      );
      message.success(nextStatus === 'enabled' ? '密钥已启用' : '密钥已禁用');
    } finally {
      setTogglingId(null);
    }
  }, []);

  const openTestModal = useCallback((record: ApiKeyRow) => {
    setTestKey(record);
  }, []);

  const openCreateSelfKey = useCallback(() => {
    setEditingSelfKey(null);
    setSelfKeyModalMode('create');
    setCreateOpen(true);
  }, []);

  const openEditSelfKey = useCallback((record: ApiKeyRow) => {
    if (record.source !== 'self') return;
    setEditingSelfKey(record);
    setSelfKeyModalMode('edit');
    setCreateOpen(true);
  }, []);

  const handleCreateSelfKey = useCallback(async (payload: SelfApiKeyFormPayload, editingId?: string) => {
    setCreating(true);
    try {
      if (editingId) {
        const updated = await updateSelfBuiltApiKey(editingId, payload);
        if (!updated) {
          message.error('仅自建密钥支持编辑');
          return;
        }
        message.success('自建密钥已更新');
        setCreateOpen(false);
        setEditingSelfKey(null);
        await loadData(appliedQueryRef.current);
        setDetailKey((prev) => (prev?.id === editingId ? updated : prev));
        setLogKey((prev) => (prev?.id === editingId ? updated : prev));
        return;
      }

      const created = await createSelfBuiltApiKey(payload);
      message.success('自建密钥已创建');
      setCreateOpen(false);
      await loadData(appliedQueryRef.current);
      setDetailKey(created);
    } catch {
      message.error(editingId ? '保存失败，请稍后重试' : '创建失败，请稍后重试');
    } finally {
      setCreating(false);
    }
  }, [loadData]);

  const columns: ColumnsType<ApiKeyRow> = useMemo(() => [
    {
      title: '密钥名称',
      dataIndex: 'name',
      width: 168,
      fixed: 'left',
      ellipsis: true,
      render: (name: string, record) => (
        <TruncatedTooltip title={name}>
          <button type="button" className="api-key-name-link" onClick={() => setDetailKey(record)}>
            {name}
          </button>
        </TruncatedTooltip>
      ),
    },
    {
      title: '密钥',
      dataIndex: 'key',
      width: 248,
      render: (key: string) => {
        const masked = maskApiKey(key);
        return (
          <div className="api-key-secret-cell">
            <TruncatedTooltip title={masked}>
              <code className="key-code api-key-key-chip">{masked}</code>
            </TruncatedTooltip>
            <Tooltip title="复制完整密钥">
              <Button
                type="text"
                size="small"
                className="api-key-copy-btn"
                icon={<CopyOutlined />}
                onClick={() => copyText(key)}
              />
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: '来源',
      dataIndex: 'source',
      width: 76,
      render: (source: ApiKeySource) => (
        <Tag className={`api-key-source-tag api-key-source-tag--${source}`} bordered={false}>
          {API_KEY_SOURCE_LABELS[source]}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 92,
      render: (status: KeyStatus) => (
        <span className={`api-key-status-pill api-key-status-pill--${status}`}>
          <span className="api-key-status-dot" aria-hidden />
          {statusLabel[status]}
        </span>
      ),
    },
    {
      title: '允许模型/模型名称',
      dataIndex: 'allowedModels',
      width: 196,
      ellipsis: true,
      render: (_, record) => renderAllowedModelsCell(record),
    },
    {
      title: 'IP 白名单',
      dataIndex: 'ipWhitelist',
      width: 140,
      ellipsis: true,
      render: (value: string, record) => {
        if (record.source === 'self') return '—';
        if (!value?.trim()) return '—';
        const lines = value.trim().split(/\s+/);
        const display = lines.length <= 1 ? lines[0] : `${lines[0]} 等 ${lines.length} 条`;
        return (
          <TruncatedTooltip title={lines.join('\n')} multiline>
            {display}
          </TruncatedTooltip>
        );
      },
    },
    {
      title: '描述',
      dataIndex: 'remark',
      width: 168,
      ellipsis: true,
      render: (value: string) => {
        const text = value?.trim();
        if (!text) return '—';
        return (
          <TruncatedTooltip title={text} multiline>
            {text}
          </TruncatedTooltip>
        );
      },
    },
    { title: '创建时间', dataIndex: 'createdAt', width: 168 },
    {
      title: '最近使用',
      dataIndex: 'lastUsedAt',
      width: 168,
      render: (value: string | null) => value || '—',
    },
    {
      title: '操作',
      key: 'actions',
      width: 196,
      fixed: 'right',
      render: (_, record) => {
        const moreItems: MenuProps['items'] = [
          {
            key: 'test',
            icon: <ThunderboltOutlined />,
            label: '测试',
            onClick: () => openTestModal(record),
          },
        ];
        if (record.source === 'self') {
          moreItems.push({
            key: 'detail',
            icon: <InfoCircleOutlined />,
            label: '查看详情',
            onClick: () => setDetailKey(record),
          });
        }
        moreItems.push({
          key: 'logs',
          icon: <FileSearchOutlined />,
          label: '用量日志',
          onClick: () => setLogKey(record),
        });

        return (
          <div className="api-key-actions">
            <Button
              type="link"
              size="small"
              loading={togglingId === record.id}
              danger={record.status === 'enabled'}
              onClick={() => handleSetStatus(record, record.status === 'enabled' ? 'disabled' : 'enabled')}
            >
              {record.status === 'enabled' ? '禁用' : '启用'}
            </Button>
            {record.source === 'self' ? (
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => openEditSelfKey(record)}
              >
                编辑
              </Button>
            ) : (
              <Button
                type="link"
                size="small"
                icon={<InfoCircleOutlined />}
                onClick={() => setDetailKey(record)}
              >
                详情
              </Button>
            )}
            <Dropdown menu={{ items: moreItems }} trigger={['click']}>
              <Button type="link" size="small" icon={<MoreOutlined />}>
                更多
              </Button>
            </Dropdown>
          </div>
        );
      },
    },
  ], [handleSetStatus, openEditSelfKey, openTestModal, togglingId]);

  return (
    <div className="saas-page api-keys-page">
      <PageHeader
        title="企业密钥"
        description="管理系统密钥与自建密钥，控制企业侧启用状态，并查看调用用量。"
      />

      <ApiKeyStatsBar summary={listSummary} />

      <Card bordered={false} className="page-card platform-section-card api-keys-card">
        <div className="api-keys-toolbar">
          <div className="api-keys-toolbar-callout" role="note">
            <InfoCircleOutlined className="api-keys-toolbar-callout-icon" aria-hidden />
            <p className="api-keys-toolbar-hint">
              系统密钥通过「接口调用获取密钥」与运营管理端同步；自建密钥由企业自行维护，用量仅统计内部应用调用。
            </p>
          </div>
          <Space wrap className="api-keys-toolbar-actions">
            <Button
              type="primary"
              icon={<CloudDownloadOutlined />}
              loading={syncing}
              onClick={handleSyncFromAdmin}
            >
              接口调用获取密钥
            </Button>
            <Button icon={<PlusOutlined />} onClick={openCreateSelfKey}>
              自建密钥
            </Button>
          </Space>
        </div>

        <div className="api-keys-filter-bar">
          <Form form={form} layout="vertical" className="filter-panel platform-section-filter api-keys-filter-form">
            <div className="filter-inline-row api-keys-filter-row">
              <Form.Item name="name" label="密钥名称" className="filter-inline-field">
                <Input placeholder="模糊搜索" allowClear prefix={<SearchOutlined className="api-keys-filter-input-icon" />} />
              </Form.Item>
              <Form.Item name="status" label="状态" initialValue="all" className="filter-inline-field">
                <Select
                  options={[
                    { value: 'all', label: '全部' },
                    { value: 'enabled', label: '已启用' },
                    { value: 'disabled', label: '已禁用' },
                  ]}
                />
              </Form.Item>
              <div className="filter-actions">
                <Button type="primary" icon={<SearchOutlined />} loading={loading} onClick={handleSearch}>
                  查询
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
              </div>
            </div>
          </Form>
        </div>

        <div className="api-keys-table-head">
          <span className="api-keys-table-title">密钥列表</span>
          <Tag bordered={false} className="platform-count-tag api-keys-count-tag">
            共 {listSummary.total} 条
          </Tag>
        </div>

        <Table
          rowKey="id"
          className="platform-data-table api-keys-table"
          columns={columns}
          dataSource={rows}
          loading={loading}
          size="middle"
          scroll={{ x: 1680 }}
          rowClassName={(record) => (record.status === 'disabled' ? 'api-key-row--disabled' : '')}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无密钥，可从管理端同步或新建自建密钥"
              />
            ),
          }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
            showTotal: (total) => `共 ${total} 条`,
            onChange: handleTableChange,
          }}
        />
      </Card>

      <ApiKeyTestModal
        record={testKey}
        open={!!testKey}
        onClose={() => setTestKey(null)}
        onTestSuccess={() => loadData(appliedQueryRef.current)}
      />

      <SelfApiKeyModal
        open={createOpen}
        mode={selfKeyModalMode}
        editingRecord={editingSelfKey}
        confirming={creating}
        onCancel={() => {
          setCreateOpen(false);
          setEditingSelfKey(null);
        }}
        onSubmit={handleCreateSelfKey}
      />

      <ApiKeyDetailDrawer
        record={detailKey}
        open={!!detailKey}
        onClose={() => setDetailKey(null)}
        onEdit={openEditSelfKey}
      />

      <Drawer
        title={logKey ? `${logKey.name} · 用量日志` : '用量日志'}
        open={!!logKey}
        onClose={() => setLogKey(null)}
        width={960}
        destroyOnClose
        className="api-key-usage-log-drawer"
      >
        {logKey ? (
          <UsageLogPanel
            apiKeyName={logKey.name}
            apiKeySource={logKey.source}
            showAccountOverview={false}
            embedded
          />
        ) : null}
      </Drawer>
    </div>
  );
}
