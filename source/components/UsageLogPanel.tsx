import './page.css';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Select,
  Table,
  Tag,
  Tooltip,
  message,
} from 'antd';
import {
  DollarOutlined,
  ExportOutlined,
  ReloadOutlined,
  SearchOutlined,
  SyncOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import { fetchUsageLogs, type UsageQuery } from './services';
import { downloadKeyUsageLogCsv } from './exportUsageLogs';
import {
  API_KEY_SOURCE_LABELS,
  formatCny,
  resolveUsageLogApiKeySource,
  sortUsageLogsByTimeDesc,
  type ApiKeySource,
  type UsageLogRow,
} from './mockData';
import {
  formatUsageLogApiKeyName,
  formatUsageLogCost,
  formatUsageLogDuration,
  formatUsageLogModel,
  formatUsageLogTokens,
  computeUsageConsumeTotal,
} from './usageLogDisplay';
import { createTimeTableColumn } from './tableTimeColumn';
import { TableEllipsisModelTag, TableEllipsisText } from './tableEllipsisCell';

const DEFAULT_POLL_INTERVAL_MS = 5000;

export interface UsageLogPanelProps {
  /** 固定按密钥筛选；隐藏密钥名称查询条件与列表列 */
  apiKeyName?: string;
  /** 当前密钥来源；自建密钥仅展示系统内部应用调用用量 */
  apiKeySource?: ApiKeySource;
  /** 是否展示账户概览模块 */
  showAccountOverview?: boolean;
  /** 自动轮询间隔（毫秒），0 表示不轮询 */
  pollIntervalMs?: number;
  /** 嵌入抽屉等容器时使用 */
  embedded?: boolean;
}

export function UsageLogPanel({
  apiKeyName,
  apiKeySource,
  showAccountOverview = !apiKeyName,
  pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
  embedded = false,
}: UsageLogPanelProps) {
  const [form] = Form.useForm();
  const [rows, setRows] = useState<UsageLogRow[]>([]);
  const [balance, setBalance] = useState({ current: 0, totalSpent: 0, unlimited: false });
  const [consumeTotal, setConsumeTotal] = useState<number | null>(0);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [refreshAt, setRefreshAt] = useState<Date | null>(null);
  const appliedQueryRef = useRef<UsageQuery>({});

  const effectivePollIntervalMs = useMemo(() => {
    if (pollIntervalMs <= 0) return 0;
    if (apiKeySource === 'self') return 0;
    return pollIntervalMs;
  }, [apiKeySource, pollIntervalMs]);

  const buildQuery = useCallback((values: {
    model?: string;
    filterApiKeyName?: string;
    apiKeySource?: UsageQuery['apiKeySource'];
  }): UsageQuery => ({
    model: values.model,
    apiKeyName: apiKeyName ?? values.filterApiKeyName,
    apiKeySource: apiKeyName ? undefined : (values.apiKeySource || 'all'),
    logType: '消耗',
  }), [apiKeyName]);

  const loadData = useCallback(async (query: UsageQuery = {}, options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    const systemOnlyRefresh = silent && query.refreshScope === 'system-only';
    if (!silent) setLoading(true);
    else setPolling(true);
    appliedQueryRef.current = query;

    try {
      const result = await fetchUsageLogs(query);
      let mergedRows = result.rows;

      if (systemOnlyRefresh) {
        setRows((prev) => {
          const selfConsumeRows = prev.filter(
            (row) => row.type === '消耗'
              && row.apiKeyName
              && resolveUsageLogApiKeySource(row.apiKeyName) === 'self',
          );
          mergedRows = sortUsageLogsByTimeDesc([...result.rows, ...selfConsumeRows]);
          return mergedRows;
        });
      } else {
        setRows(mergedRows);
      }

      setConsumeTotal(computeUsageConsumeTotal(mergedRows));
      setBalance(result.balance);
      setRefreshAt(result.fetchedAt);
    } finally {
      if (!silent) setLoading(false);
      else setPolling(false);
    }
  }, []);

  useEffect(() => {
    const initialQuery = buildQuery({ apiKeySource: 'all' });
    loadData(initialQuery);

    if (effectivePollIntervalMs <= 0) return undefined;

    const timer = window.setInterval(() => {
      const current = appliedQueryRef.current;
      if (current.apiKeySource === 'self') return;
      loadData({ ...current, refreshScope: 'system-only' }, { silent: true });
    }, effectivePollIntervalMs);
    return () => window.clearInterval(timer);
  }, [apiKeyName, buildQuery, effectivePollIntervalMs, loadData]);

  const columns: ColumnsType<UsageLogRow> = useMemo(() => {
    const remarkColumn = {
      title: '详情/备注',
      dataIndex: 'remark' as const,
      ellipsis: { showTitle: false, tooltip: true },
      render: (value: string) => (
        <TableEllipsisText value={value} className="usage-log-cell-ellipsis" />
      ),
    };

    const base: ColumnsType<UsageLogRow> = [
      createTimeTableColumn<UsageLogRow>({ width: 168 }),
      {
        title: '模型',
        dataIndex: 'model',
        width: 160,
        render: (value: string, record) => (
          <TableEllipsisModelTag model={formatUsageLogModel(value, record.type)} />
        ),
      },
      {
        title: 'tokens',
        dataIndex: 'tokens',
        width: 100,
        align: 'right' as const,
        render: (value: number, record) => (
          <TableEllipsisText
            value={formatUsageLogTokens(value, record.type)}
            className="usage-log-cell-ellipsis usage-log-cell-ellipsis--numeric"
          />
        ),
      },
      {
        title: '费用（CNY）',
        dataIndex: 'costCny',
        width: 120,
        align: 'right' as const,
        render: (value: number, record) => (
          <TableEllipsisText
            value={formatUsageLogCost(value, record.type, record)}
            className="usage-log-cell-ellipsis usage-log-cell-ellipsis--numeric usage-log-cost"
          />
        ),
      },
      {
        title: '耗时',
        dataIndex: 'durationMs',
        width: 96,
        align: 'right' as const,
        render: (value: number, record) => (
          <TableEllipsisText
            value={formatUsageLogDuration(value, record.type)}
            className="usage-log-cell-ellipsis usage-log-cell-ellipsis--numeric"
          />
        ),
      },
      remarkColumn,
    ];

    if (apiKeyName) return base;

    return [
      ...base.slice(0, 2),
      {
        title: '密钥名称',
        dataIndex: 'apiKeyName',
        width: 140,
        className: 'usage-log-col-key-name',
        onHeaderCell: () => ({ className: 'usage-log-col-key-name' }),
        onCell: () => ({ className: 'usage-log-cell-key-name' }),
        render: (value: string, record) => (
          <TableEllipsisText
            value={formatUsageLogApiKeyName(value, record.type)}
            className="usage-log-cell-ellipsis usage-log-cell-ellipsis--key-name"
          />
        ),
      },
      {
        title: '密钥来源',
        dataIndex: 'apiKeySource',
        width: 88,
        render: (_: unknown, record: UsageLogRow) => {
          if (!record.apiKeyName?.trim()) return '—';
          const source = resolveUsageLogApiKeySource(record.apiKeyName);
          if (!source) return '—';
          return (
            <Tag className={`api-key-source-tag api-key-source-tag--${source}`} bordered={false}>
              {API_KEY_SOURCE_LABELS[source]}
            </Tag>
          );
        },
      },
      ...base.slice(2),
    ];
  }, [apiKeyName]);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    loadData(buildQuery(values));
    message.success('已按条件刷新用量数据');
  };

  const handleReset = () => {
    form.resetFields();
    const query = buildQuery({ apiKeySource: 'all' });
    loadData(query);
    message.info('已重置筛选条件');
  };

  const handleExport = () => {
    if (!apiKeyName) return;
    if (!rows.length) {
      message.warning('当前列表暂无数据可导出');
      return;
    }
    const fileName = downloadKeyUsageLogCsv({
      apiKeyName,
      rows,
      consumeTotal,
    });
    message.success(`已导出 ${fileName}`);
  };

  const refreshTimeText = refreshAt?.toLocaleString('zh-CN', {
    hour12: false,
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }) ?? '—';

  return (
    <div className={embedded ? 'usage-log-panel usage-log-panel--embedded' : 'usage-log-panel'}>
      {apiKeySource === 'self' ? (
        <Alert
          className="usage-log-panel-self-hint"
          type="info"
          showIcon
          message="自建密钥用量范围"
          description="仅展示系统内部应用调用该自建密钥产生的消耗记录；企业业务侧自行发起的调用不在此统计。"
        />
      ) : null}
      {showAccountOverview ? (
        <section className="balance-stat-row" aria-label="余额消耗情况">
          <div className="balance-stat-row-head">
            <div className="balance-stat-row-title-block">
              <h5 className="balance-stat-row-title">系统密钥账户概览</h5>
              <span className="balance-stat-row-desc">每 5 秒同步系统密钥相关数据；自建密钥记录不自动刷新</span>
            </div>
            <div className="balance-refresh-meta">
              <span className="balance-live-dot" aria-hidden />
              <SyncOutlined className="balance-refresh-icon" spin={polling} />
              <span>最近更新 {refreshTimeText}</span>
            </div>
          </div>

          <div className="balance-stat-row-grid">
            <Tooltip title="当前账户剩余额度">
              <div className="balance-stat-pill balance-stat-pill--balance">
                <div className="balance-stat-pill-head">
                  <WalletOutlined className="balance-stat-pill-icon" aria-hidden />
                  <span className="balance-stat-pill-label">当前余额</span>
                </div>
                <div className="balance-stat-pill-value">¥{formatCny(balance.current)}</div>
              </div>
            </Tooltip>

            <Tooltip title="累计消费总额">
              <div className="balance-stat-pill balance-stat-pill--spent">
                <div className="balance-stat-pill-head">
                  <DollarOutlined className="balance-stat-pill-icon" aria-hidden />
                  <span className="balance-stat-pill-label">累计消费</span>
                </div>
                <div className="balance-stat-pill-value">¥{formatCny(balance.totalSpent)}</div>
              </div>
            </Tooltip>
          </div>
        </section>
      ) : effectivePollIntervalMs > 0 ? (
        <div className="usage-log-panel-refresh-meta">
          <span className="balance-live-dot" aria-hidden />
          <SyncOutlined className="balance-refresh-icon" spin={polling} />
          <span>最近更新 {refreshTimeText}</span>
        </div>
      ) : null}

      <Card
        bordered={false}
        className={embedded ? 'page-card platform-section-card usage-log-panel-card--embedded' : 'page-card platform-section-card'}
      >
        <Form form={form} layout="vertical" className="filter-panel platform-section-filter">
          <div className="filter-inline-row">
            <Form.Item name="model" label="模型名称" className="filter-inline-field">
              <Input placeholder="模糊搜索" allowClear />
            </Form.Item>
            {!apiKeyName ? (
              <>
                <Form.Item name="filterApiKeyName" label="密钥名称" className="filter-inline-field">
                  <Input placeholder="模糊搜索" allowClear />
                </Form.Item>
                <Form.Item name="apiKeySource" label="密钥来源" initialValue="all" className="filter-inline-field">
                  <Select
                    options={[
                      { value: 'all', label: '全部' },
                      { value: 'system', label: '系统' },
                      { value: 'self', label: '自建' },
                    ]}
                  />
                </Form.Item>
              </>
            ) : null}
            <div className="filter-actions">
              <Button type="primary" icon={<SearchOutlined />} loading={loading} onClick={handleSearch}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
              {apiKeyName ? (
                <Button icon={<ExportOutlined />} onClick={handleExport}>
                  导出
                </Button>
              ) : null}
            </div>
          </div>
        </Form>

        <Table
          rowKey="id"
          className="platform-data-table"
          columns={columns}
          dataSource={rows}
          loading={loading}
          size="middle"
          tableLayout="fixed"
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        />

        <div className="usage-result-summary" aria-label="查询结果汇总">
          <span>
            消耗费用共计{' '}
            <strong>
              {consumeTotal === null ? '—' : `¥${formatCny(consumeTotal)}`}
            </strong>
          </span>
        </div>
      </Card>
    </div>
  );
}
