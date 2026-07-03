import '../../components/page.css';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Form, Input, Select, Space, Table, Tag, Typography, message } from 'antd';
import { InfoCircleOutlined, ReloadOutlined, SearchOutlined, SyncOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import {
  fetchEnterpriseApplications,
  syncEnterpriseApplicationStatus,
  type EnterpriseApplicationQuery,
} from '../../components/admin/applyService';
import { PageHeader } from '../../components/PageHeader';
import {
  ENTERPRISE_APPLY_PROCESS_LABELS,
  type EnterpriseApplyProcessStatus,
  type StoredApplyRecord,
} from '../../components/mockData';

const processStatusColor: Record<EnterpriseApplyProcessStatus, string> = {
  unprocessed: 'orange',
  processed: 'success',
  ignored: 'default',
};

function renderEllipsisCell(value?: string | null, options?: { multiline?: boolean }) {
  const text = value?.trim() || '—';
  if (text === '—') return text;
  return (
    <Typography.Text
      ellipsis={{
        tooltip: {
          title: text,
          placement: 'topLeft',
          overlayInnerStyle: options?.multiline
            ? { whiteSpace: 'pre-wrap', maxWidth: 480 }
            : { maxWidth: 400 },
        },
      }}
      className="enterprise-apply-cell-ellipsis"
    >
      {text}
    </Typography.Text>
  );
}

function buildQueryFromForm(values: {
  processStatus?: EnterpriseApplicationQuery['processStatus'];
  companyName?: string;
}): EnterpriseApplicationQuery {
  return {
    processStatus: values.processStatus ?? 'all',
    companyName: values.companyName?.trim() || undefined,
  };
}

export default function EnterpriseApplicationsPage() {
  const [form] = Form.useForm();
  const [rows, setRows] = useState<StoredApplyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const appliedQueryRef = useRef<EnterpriseApplicationQuery>({ processStatus: 'all' });

  const loadData = useCallback(async (query: EnterpriseApplicationQuery = {}, options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) setLoading(true);
    appliedQueryRef.current = query;

    try {
      const data = await fetchEnterpriseApplications(query);
      setRows(data);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData({ processStatus: 'all' });
  }, [loadData]);

  const handleSearch = () => {
    loadData(buildQueryFromForm(form.getFieldsValue()));
    message.success('已刷新列表');
  };

  const handleReset = () => {
    form.resetFields();
    loadData({ processStatus: 'all' });
    message.info('筛选条件已重置');
  };

  const handleStatusSync = async () => {
    setSyncing(true);
    try {
      const result = await syncEnterpriseApplicationStatus();
      setLastSyncedAt(result.syncedAt);
      await loadData(appliedQueryRef.current, { silent: true });
      if (result.updatedCount > 0) {
        const parts: string[] = [];
        if (result.processedCount > 0) parts.push(`已处理 ${result.processedCount} 条`);
        if (result.ignoredCount > 0) parts.push(`不处理 ${result.ignoredCount} 条`);
        message.success(`状态同步完成，更新 ${result.updatedCount} 条${parts.length ? `（${parts.join('，')}）` : ''}`);
      } else {
        message.info(
          result.skippedCount > 0
            ? `状态已与运营管理端一致；${result.skippedCount} 条尚未进入运营端，未更新`
            : '状态已与运营管理端一致，无需更新',
        );
      }
    } catch {
      message.error('状态同步失败，请稍后重试');
    } finally {
      setSyncing(false);
    }
  };

  const columns: ColumnsType<StoredApplyRecord> = useMemo(() => [
    {
      title: '企业名称',
      dataIndex: 'companyName',
      width: 160,
      ellipsis: true,
      fixed: 'left',
      render: (value: string) => renderEllipsisCell(value),
    },
    {
      title: '统一社会信用代码',
      dataIndex: 'creditCode',
      width: 180,
      ellipsis: true,
      render: (value: string) => renderEllipsisCell(value),
    },
    { title: '联系人', dataIndex: 'contactName', width: 100 },
    { title: '联系电话', dataIndex: 'contactPhone', width: 128 },
    {
      title: '联系邮箱',
      dataIndex: 'contactEmail',
      width: 180,
      ellipsis: true,
      render: (value: string) => renderEllipsisCell(value),
    },
    {
      title: '使用场景说明',
      dataIndex: 'usageScene',
      ellipsis: true,
      render: (value: string) => renderEllipsisCell(value, { multiline: true }),
    },
    { title: '提交时间', dataIndex: 'submittedAt', width: 168 },
    {
      title: '状态',
      dataIndex: 'processStatus',
      width: 96,
      render: (status: EnterpriseApplyProcessStatus) => (
        <Tag color={processStatusColor[status]}>{ENTERPRISE_APPLY_PROCESS_LABELS[status]}</Tag>
      ),
    },
  ], []);

  const unprocessedCount = rows.filter((row) => row.processStatus === 'unprocessed').length;
  const ignoredCount = rows.filter((row) => row.processStatus === 'ignored').length;

  return (
    <div className="saas-page">
      <PageHeader
        title="申请列表"
        description="展示 SaaS 端企业提交的接入申请信息（只读）；处理状态通过【状态同步】从运营管理端增量获取。"
        extra={(
          <Button icon={<ReloadOutlined />} onClick={() => loadData(appliedQueryRef.current)}>
            刷新列表
          </Button>
        )}
      />

      <Card bordered={false} className="page-card platform-section-card">
        <div className="enterprise-apply-toolbar">
          <div className="enterprise-apply-toolbar-callout" role="note">
            <InfoCircleOutlined className="enterprise-apply-toolbar-icon" aria-hidden />
            <p className="enterprise-apply-toolbar-hint">
              列表数据来源于企业工作台提交记录，本页仅查看。点击【状态同步】按申请 ID 从运营管理端增量拉取处理状态；
              <strong>尚未进入运营管理端的申请不做状态更新</strong>。
            </p>
          </div>
          <Space wrap className="enterprise-apply-toolbar-actions">
            <Button
              type="primary"
              icon={<SyncOutlined />}
              loading={syncing}
              onClick={handleStatusSync}
            >
              状态同步
            </Button>
          </Space>
        </div>

        {lastSyncedAt ? (
          <div className="enterprise-apply-sync-meta">
            上次状态同步：<strong>{lastSyncedAt}</strong>
          </div>
        ) : null}

        <Form
          form={form}
          layout="vertical"
          className="filter-panel platform-section-filter"
          initialValues={{ processStatus: 'all' }}
        >
          <div className="filter-inline-row">
            <Form.Item name="processStatus" label="状态" className="filter-inline-field">
              <Select
                style={{ width: '100%' }}
                options={[
                  { value: 'all', label: '全部' },
                  { value: 'unprocessed', label: '未处理' },
                  { value: 'processed', label: '已处理' },
                  { value: 'ignored', label: '不处理' },
                ]}
              />
            </Form.Item>
            <Form.Item name="companyName" label="企业名称" className="filter-inline-field" style={{ maxWidth: 280 }}>
              <Input allowClear placeholder="模糊查询企业名称" />
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

        <div className="platform-section-toolbar">
          <Tag bordered={false} className="platform-count-tag">
            匹配 {rows.length} 条 · 未处理 {unprocessedCount} 条 · 不处理 {ignoredCount} 条
          </Tag>
        </div>

        <Table
          rowKey="id"
          className="platform-data-table"
          columns={columns}
          dataSource={rows}
          loading={loading}
          scroll={{ x: 1180 }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
          locale={{ emptyText: '暂无匹配的企业申请' }}
        />
      </Card>
    </div>
  );
}
