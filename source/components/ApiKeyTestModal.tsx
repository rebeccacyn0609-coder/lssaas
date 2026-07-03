import './page.css';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Modal, Space, Table, message } from 'antd';
import { ReloadOutlined, ThunderboltOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import { fetchApiKeyTestModels, testApiKeyModels } from './services';
import {
  buildApiKeyTestModelRows,
  type ApiKeyRow,
  type ApiKeyTestConnectionRow,
  type ApiKeyTestModelRow,
} from './mockData';

function mergeTestResults(
  prev: Record<string, Pick<ApiKeyTestConnectionRow, 'durationMs' | 'errorMessage' | 'testedAt'>>,
  rows: ApiKeyTestConnectionRow[],
) {
  const next = { ...prev };
  rows.forEach((row) => {
    next[row.modelName] = {
      durationMs: row.durationMs,
      errorMessage: row.errorMessage,
      testedAt: row.testedAt,
    };
  });
  return next;
}

export function ApiKeyTestModal({
  record,
  open,
  onClose,
  onTestSuccess,
}: {
  record: ApiKeyRow | null;
  open: boolean;
  onClose: () => void;
  onTestSuccess?: () => void;
}) {
  const [models, setModels] = useState<string[]>([]);
  const [results, setResults] = useState<Record<string, Pick<ApiKeyTestConnectionRow, 'durationMs' | 'errorMessage' | 'testedAt'>>>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [testingModels, setTestingModels] = useState<Set<string>>(new Set());
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);

  const loadModels = useCallback(async (showSuccessMessage = false) => {
    if (!record) return;
    setLoadingModels(true);
    try {
      const data = await fetchApiKeyTestModels(record.id);
      setModels(data.models);
      setRefreshedAt(data.fetchedAt);
      setSelectedRowKeys((prev) => prev.filter((key) => data.models.includes(String(key))));
      if (showSuccessMessage) {
        message.success('模型列表已刷新');
      }
    } catch {
      message.error('刷新模型列表失败');
    } finally {
      setLoadingModels(false);
    }
  }, [record]);

  useEffect(() => {
    if (!open || !record) return;
    setResults({});
    setSelectedRowKeys([]);
    setModels([]);
    setRefreshedAt(null);
    loadModels(false);
  }, [open, record?.id, loadModels]);

  const tableRows = useMemo(
    () => buildApiKeyTestModelRows(models, results),
    [models, results],
  );

  const runTest = useCallback(async (modelNames: string[]) => {
    if (!record || !modelNames.length) {
      message.warning('请至少选择一个模型');
      return;
    }
    const pending = new Set(modelNames);
    setTestingModels((prev) => new Set([...prev, ...modelNames]));
    try {
      const result = await testApiKeyModels(record.id, modelNames);
      setResults((prev) => mergeTestResults(prev, result.rows));
      if (result.success) {
        message.success(`已完成 ${modelNames.length} 个模型的连通测试`);
        onTestSuccess?.();
      } else if (result.failureReason && result.failureReason !== '请至少选择一个模型') {
        message.error(result.failureReason);
      }
    } catch {
      message.error('测试请求失败，请稍后重试');
    } finally {
      setTestingModels((prev) => {
        const next = new Set(prev);
        pending.forEach((name) => next.delete(name));
        return next;
      });
    }
  }, [onTestSuccess, record]);

  const handleTestSelected = () => {
    runTest(selectedRowKeys.map(String));
  };

  const handleTestAll = () => {
    setSelectedRowKeys(models);
    runTest(models);
  };

  const columns: ColumnsType<ApiKeyTestModelRow> = useMemo(() => [
    {
      title: '模型名称',
      dataIndex: 'modelName',
      width: 200,
      align: 'left',
      ellipsis: true,
    },
    {
      title: '响应时间 (ms)',
      dataIndex: 'durationMs',
      width: 128,
      align: 'left',
      render: (value: number | null) => (value != null && value > 0 ? value : value === 0 ? '0' : '—'),
    },
    {
      title: '错误信息',
      dataIndex: 'errorMessage',
      align: 'left',
      ellipsis: true,
      render: (value: string) => (
        value?.trim()
          ? <span className="api-key-test-error">{value}</span>
          : '—'
      ),
    },
    {
      title: '测试日期',
      dataIndex: 'testedAt',
      width: 168,
      align: 'left',
      render: (value: string) => value?.trim() || '—',
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      align: 'left',
      render: (_, row) => (
        <Button
          type="link"
          size="small"
          className="api-key-test-row-btn"
          icon={<ThunderboltOutlined />}
          loading={testingModels.has(row.modelName)}
          disabled={!models.length}
          onClick={() => runTest([row.modelName])}
        >
          测试
        </Button>
      ),
    },
  ], [models.length, runTest, testingModels]);

  const refreshTimeText = refreshedAt?.toLocaleString('zh-CN', {
    hour12: false,
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const batchTesting = selectedRowKeys.some((key) => testingModels.has(String(key)));

  return (
    <Modal
      title={record ? `${record.name} · 密钥测试` : '密钥测试'}
      open={open}
      onCancel={onClose}
      footer={(
        <Button onClick={onClose}>
          关闭
        </Button>
      )}
      width={920}
      destroyOnClose
      className="api-key-test-modal"
    >
      <Alert
        className="api-key-test-fee-alert"
        type="warning"
        showIcon
        message="测试模型将会产生测试费用，点击测试将视作认可，请谨慎操作。"
      />

      <div className="api-key-test-toolbar">
        <Space wrap size={12}>
          <Button
            icon={<ReloadOutlined />}
            loading={loadingModels}
            onClick={() => loadModels(true)}
          >
            刷新模型列表
          </Button>
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            disabled={!selectedRowKeys.length}
            loading={batchTesting}
            onClick={handleTestSelected}
          >
            测试选中
          </Button>
          <Button
            icon={<ThunderboltOutlined />}
            disabled={!models.length}
            loading={testingModels.size > 0 && selectedRowKeys.length === models.length}
            onClick={handleTestAll}
          >
            全选测试
          </Button>
        </Space>
        {refreshTimeText ? (
          <span className="api-key-test-refresh-meta">模型列表更新于 {refreshTimeText}</span>
        ) : null}
      </div>

      <Table
        rowKey="modelName"
        className="platform-data-table api-key-test-table"
        columns={columns}
        dataSource={tableRows}
        loading={loadingModels}
        pagination={false}
        size="small"
        tableLayout="fixed"
        scroll={{ x: 872, y: 360 }}
        locale={{ emptyText: record?.source === 'system' && !models.length ? '当前密钥暂无可测试模型' : '暂无模型' }}
        rowSelection={{
          columnWidth: 48,
          selectedRowKeys,
          onChange: setSelectedRowKeys,
          getCheckboxProps: (row) => ({
            disabled: testingModels.has(row.modelName),
          }),
        }}
      />
    </Modal>
  );
}
