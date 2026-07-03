import '../components/page.css';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Select,
  Table,
  Tag,
  Tooltip,
  message,
} from 'antd';
import { DollarOutlined, ReloadOutlined, SearchOutlined, SyncOutlined, WalletOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import { PageHeader } from '../components/PageHeader';
import { fetchRechargeRecords, type RechargeQuery } from '../components/services';
import { formatCny, type AccountAdjustmentType, type AccountBalance, type RechargeRecordRow } from '../components/mockData';

const POLL_INTERVAL_MS = 5000;

const recordTypeColor: Record<AccountAdjustmentType, string> = {
  充值: 'green',
  扣款: 'orange',
};

function buildQueryFromForm(values: { recordType?: RechargeQuery['recordType'] }): RechargeQuery {
  return {
    recordType: values.recordType || 'all',
  };
}

export default function RechargeRecordsPage() {
  const [form] = Form.useForm();
  const [rows, setRows] = useState<RechargeRecordRow[]>([]);
  const [rechargeTotal, setRechargeTotal] = useState(0);
  const [deductTotal, setDeductTotal] = useState(0);
  const [balance, setBalance] = useState<AccountBalance>({ current: 0, totalSpent: 0, unlimited: false });
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [refreshAt, setRefreshAt] = useState<Date | null>(null);
  const appliedQueryRef = useRef<RechargeQuery>({});

  const loadData = useCallback(async (query: RechargeQuery = {}, options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) setLoading(true);
    else setPolling(true);
    appliedQueryRef.current = query;

    try {
      const result = await fetchRechargeRecords(query);
      setRows(result.rows);
      setRechargeTotal(result.rechargeTotal);
      setDeductTotal(result.deductTotal);
      setBalance(result.balance);
      setRefreshAt(result.fetchedAt);
    } finally {
      if (!silent) setLoading(false);
      else setPolling(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const timer = window.setInterval(() => {
      loadData(appliedQueryRef.current, { silent: true });
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [loadData]);

  const columns: ColumnsType<RechargeRecordRow> = useMemo(() => [
    { title: '时间', dataIndex: 'time', width: 168 },
    {
      title: '类型',
      dataIndex: 'type',
      width: 88,
      render: (type: AccountAdjustmentType) => <Tag color={recordTypeColor[type]}>{type}</Tag>,
    },
    {
      title: '金额（CNY）',
      dataIndex: 'amount',
      width: 140,
      align: 'right',
      render: (value: number, record) => (
        record.type === '充值'
          ? <span className="amount-positive">+¥{formatCny(value)}</span>
          : <span className="usage-log-cost usage-log-cost--negative">−¥{formatCny(value)}</span>
      ),
    },
    {
      title: '变动后余额',
      dataIndex: 'balanceAfter',
      width: 140,
      align: 'right',
      render: (value: number) => `¥${formatCny(value)}`,
    },
    {
      title: '渠道',
      dataIndex: 'channel',
      width: 120,
      render: (value: string) => <Tag color="processing">{value}</Tag>,
    },
    { title: '操作人', dataIndex: 'operator', width: 120 },
    { title: '备注', dataIndex: 'remark', ellipsis: true },
  ], []);

  const handleSearch = () => {
    loadData(buildQueryFromForm(form.getFieldsValue()));
    message.success('已刷新记录');
  };

  const handleReset = () => {
    form.resetFields();
    loadData({});
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
    <div className="saas-page">
      <PageHeader
        title="充值记录"
        description="查看运营管理端为企业账户执行的充值与扣款记录，默认每 5 秒自动刷新；金额保留 3 位小数。"
      />

      <section className="balance-stat-row" aria-label="账户余额情况">
        <div className="balance-stat-row-head">
          <div className="balance-stat-row-title-block">
            <h5 className="balance-stat-row-title">账户概览</h5>
            <span className="balance-stat-row-desc">每 5 秒同步运营管理端最新数据</span>
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

      <Card bordered={false} className="page-card platform-section-card">
        <Form form={form} layout="vertical" className="filter-panel platform-section-filter">
          <div className="filter-inline-row">
            <Form.Item name="recordType" label="类型" initialValue="all" className="filter-inline-field">
              <Select
                options={[
                  { value: 'all', label: '全部' },
                  { value: '充值', label: '充值' },
                  { value: '扣款', label: '扣款' },
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

        <Table
          rowKey="id"
          className="platform-data-table"
          columns={columns}
          dataSource={rows}
          loading={loading}
          scroll={{ x: 980 }}
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
        />

        <div className="usage-result-summary" aria-label="记录汇总">
          <span>
            充值共计{' '}
            <strong className="usage-result-summary-amount usage-result-summary-amount--positive">
              ¥{formatCny(rechargeTotal)}
            </strong>
          </span>
          <span className="usage-result-summary-sep" aria-hidden>|</span>
          <span>
            扣款共计{' '}
            <strong className="usage-result-summary-amount usage-result-summary-amount--negative">
              ¥{formatCny(deductTotal)}
            </strong>
          </span>
        </div>
      </Card>
    </div>
  );
}
