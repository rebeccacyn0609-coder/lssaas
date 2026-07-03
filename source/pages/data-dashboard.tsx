import '../components/page.css';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Empty,
  Form,
  Select,
  Skeleton,
  Space,
  Spin,
  Tag,
  Tooltip,
  message,
} from 'antd';
import {
  ApiOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  SyncOutlined,
  ThunderboltOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

import { PageHeader } from '../components/PageHeader';
import {
  computeDataDashboard,
  formatDashboardDateRange,
  getDataDashboardKeyNameOptions,
  type DataDashboardQuery,
  type DataDashboardResult,
  type DataDashboardStats,
  type KeySourceFilter,
} from '../components/dataDashboardStats';
import { API_KEY_SOURCE_LABELS, formatCny, formatTokens, roundAmountCny, type AccountBalance } from '../components/mockData';
import { fetchRechargeRecords } from '../components/services';

echarts.use([LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

const { RangePicker } = DatePicker;
const POLL_INTERVAL_MS = 5000;

const CHART_COLORS = ['#1f5f8f', '#13c2c2', '#722ed1', '#fa8c16'];
const AXIS_LABEL = { color: '#8c8c8c', fontSize: 11 };
const SPLIT_LINE = { color: '#f0f0f0', type: 'dashed' as const };

const KEY_SOURCE_OPTIONS: { value: KeySourceFilter; label: string }[] = [
  { value: 'all', label: '全部类型' },
  { value: 'system', label: API_KEY_SOURCE_LABELS.system },
  { value: 'self', label: API_KEY_SOURCE_LABELS.self },
];

type AppliedQuery = DataDashboardQuery & {
  queriedAt: Date | null;
};

type StatItem = {
  key: string;
  label: string;
  tip: string;
  value: string;
  suffix?: string;
  prefix?: string;
  empty?: boolean;
  color: string;
  bg: string;
  icon: React.ReactNode;
};

function buildStatItems(stats: DataDashboardStats): StatItem[] {
  const costEmpty = stats.totalCost === null;
  return [
    {
      key: 'tokens',
      label: '总调用 Token 数',
      tip: '按当前筛选条件统计调用 Token 总量，整数展示。',
      value: formatTokens(stats.totalTokens),
      suffix: 'tokens',
      color: '#1f5f8f',
      bg: 'rgba(31, 95, 143, 0.1)',
      icon: <ThunderboltOutlined />,
    },
    {
      key: 'cost',
      label: '总 Token 消费金额',
      tip: '系统密钥按运营管理端单价计费；自建密钥不计入消费金额，展示为空。',
      value: costEmpty ? '—' : formatCny(stats.totalCost),
      prefix: costEmpty ? undefined : '¥',
      empty: costEmpty,
      color: '#13c2c2',
      bg: 'rgba(19, 194, 194, 0.1)',
      icon: <DollarOutlined />,
    },
    {
      key: 'calls',
      label: '总模型调用次数',
      tip: '统计区间内模型 API 调用总次数。',
      value: formatTokens(stats.totalCalls),
      suffix: '次',
      color: '#fa8c16',
      bg: 'rgba(250, 140, 22, 0.1)',
      icon: <ApiOutlined />,
    },
  ];
}

function StatGrid({ items, loading }: { items: StatItem[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="dashboard-stat-grid dashboard-stat-grid--3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card bordered={false} className="dashboard-stat-card" key={index}>
            <Skeleton active paragraph={{ rows: 2 }} />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="dashboard-stat-grid dashboard-stat-grid--3">
      {items.map((item) => (
        <Card bordered={false} className="dashboard-stat-card" key={item.key}>
          <div className="dashboard-stat-inner">
            <div className="dashboard-stat-icon" style={{ background: item.bg, color: item.color }}>
              {item.icon}
            </div>
            <div className="dashboard-stat-body">
              <div className="dashboard-stat-title-row">
                <span className="dashboard-stat-label">{item.label}</span>
                <Tooltip title={item.tip}>
                  <InfoCircleOutlined className="dashboard-stat-info" />
                </Tooltip>
              </div>
              <div
                className={`dashboard-stat-value${item.empty ? ' is-empty' : ''}`}
                style={item.empty ? undefined : { color: item.color }}
              >
                {item.prefix}
                {item.value}
                {item.suffix ? <span className="dashboard-stat-suffix">{item.suffix}</span> : null}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

const DEFAULT_QUERY: DataDashboardQuery = {
  keySource: 'all',
  keyName: undefined,
  dateRange: null,
};

export default function DataDashboardPage() {
  const [form] = Form.useForm();
  const [appliedQuery, setAppliedQuery] = useState<AppliedQuery>({
    ...DEFAULT_QUERY,
    queriedAt: new Date(),
  });
  const [dashboardResult, setDashboardResult] = useState<DataDashboardResult>(() =>
    computeDataDashboard(DEFAULT_QUERY),
  );
  const [modelFilter, setModelFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [dateRangeKey, setDateRangeKey] = useState(0);
  const [activeDatePreset, setActiveDatePreset] = useState<number | null>(null);
  const [balance, setBalance] = useState<AccountBalance>({ current: 0, totalSpent: 0, unlimited: false });
  const [balancePolling, setBalancePolling] = useState(false);
  const [balanceRefreshAt, setBalanceRefreshAt] = useState<Date | null>(null);

  const tokenChartRef = useRef<HTMLDivElement>(null);
  const callChartRef = useRef<HTMLDivElement>(null);
  const tokenChartInst = useRef<echarts.ECharts | null>(null);
  const callChartInst = useRef<echarts.ECharts | null>(null);

  const watchedKeySource = Form.useWatch<KeySourceFilter>('keySource', form) ?? 'all';

  const keyNameOptions = useMemo(
    () => getDataDashboardKeyNameOptions(watchedKeySource),
    [watchedKeySource],
  );

  const statItems = useMemo(() => buildStatItems(dashboardResult.stats), [dashboardResult.stats]);

  const modelOptions = useMemo(() => {
    const models = dashboardResult.availableModels;
    return [{ value: 'all', label: '全部模型' }, ...models.map((model) => ({ value: model, label: model }))];
  }, [dashboardResult.availableModels]);

  const scopeLabel = useMemo(() => {
    const sourceLabel = KEY_SOURCE_OPTIONS.find((item) => item.value === appliedQuery.keySource)?.label ?? '全部类型';
    const nameLabel = appliedQuery.keyName?.trim() || '全部密钥';
    return {
      source: sourceLabel,
      name: nameLabel,
      range: formatDashboardDateRange(appliedQuery.dateRange),
    };
  }, [appliedQuery]);

  const loadBalance = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (silent) setBalancePolling(true);
    try {
      const result = await fetchRechargeRecords({});
      setBalance(result.balance);
      setBalanceRefreshAt(result.fetchedAt);
    } finally {
      if (silent) setBalancePolling(false);
    }
  }, []);

  useEffect(() => {
    loadBalance();
    const timer = window.setInterval(() => {
      loadBalance({ silent: true });
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [loadBalance]);

  const toDashboardQuery = useCallback(
    (values: {
      keySource?: KeySourceFilter;
      keyName?: string;
      dateRange?: [Dayjs, Dayjs] | null;
    }): DataDashboardQuery => ({
      keySource: values.keySource ?? 'all',
      keyName: values.keyName?.trim() || undefined,
      dateRange: values.dateRange ?? null,
    }),
    [],
  );

  const applyQuery = useCallback((values: DataDashboardQuery) => {
    setLoading(true);
    setChartLoading(true);
    window.setTimeout(() => {
      const result = computeDataDashboard(values);
      setAppliedQuery({
        ...values,
        queriedAt: new Date(),
      });
      setDashboardResult(result);
      setModelFilter('all');
      setLoading(false);
      window.setTimeout(() => setChartLoading(false), 280);
      message.success('看板数据已更新');
    }, 420);
  }, []);

  const handleSearch = useCallback(() => {
    form
      .validateFields()
      .then((values) => {
        applyQuery(toDashboardQuery(values));
      })
      .catch(() => {
        message.warning('请完善筛选条件');
      });
  }, [applyQuery, form, toDashboardQuery]);

  const handleReset = useCallback(() => {
    form.setFieldsValue({
      keySource: 'all',
      keyName: undefined,
      dateRange: null,
    });
    setDateRangeKey((key) => key + 1);
    setActiveDatePreset(null);
    setModelFilter('all');
    applyQuery(DEFAULT_QUERY);
    message.info('筛选条件已重置');
  }, [applyQuery, form]);

  const applyDatePreset = useCallback(
    (days: number) => {
      const end = dayjs();
      const start = days === 0 ? end.startOf('day') : end.subtract(days - 1, 'day').startOf('day');
      const dateRange: [Dayjs, Dayjs] = [start, end];

      form.setFieldValue('dateRange', dateRange);
      setActiveDatePreset(days);

      form.validateFields().then((values) => {
        applyQuery(toDashboardQuery({ ...values, dateRange }));
      });
    },
    [applyQuery, form, toDashboardQuery],
  );

  const handleDateRangeChange = useCallback(
    (value: [Dayjs, Dayjs] | null) => {
      form.setFieldValue('dateRange', value);
      setActiveDatePreset(null);
    },
    [form],
  );

  const handleKeySourceChange = useCallback(
    (value: KeySourceFilter) => {
      const currentName = form.getFieldValue('keyName') as string | undefined;
      if (currentName && !getDataDashboardKeyNameOptions(value).some((item) => item.value === currentName)) {
        form.setFieldValue('keyName', undefined);
      }
    },
    [form],
  );

  useEffect(() => {
    form.setFieldsValue(DEFAULT_QUERY);
  }, [form]);

  const { tokenTrend, callTrend } = dashboardResult;
  const showCostMetrics = dashboardResult.stats.totalCost !== null;

  const renderTokenChart = useCallback(() => {
    if (!tokenChartRef.current || tokenTrend.length === 0) return;
    if (!tokenChartInst.current) tokenChartInst.current = echarts.init(tokenChartRef.current);

    const legendData = showCostMetrics ? ['Token 消耗', '消费金额 (CNY)'] : ['Token 消耗'];
    const series: echarts.SeriesOption[] = [
      {
        name: 'Token 消耗',
        type: 'line',
        smooth: true,
        showSymbol: false,
        areaStyle: { color: 'rgba(31, 95, 143, 0.06)' },
        data: tokenTrend.map((point) => point.tokens),
      },
    ];
    if (showCostMetrics) {
      series.push({
        name: '消费金额 (CNY)',
        type: 'line',
        smooth: true,
        showSymbol: false,
        yAxisIndex: 1,
        data: tokenTrend.map((point) => roundAmountCny(point.costCny)),
      });
    }

    tokenChartInst.current.setOption(
      {
        color: ['#1f5f8f', '#13c2c2'],
        animationDuration: 600,
        tooltip: {
          trigger: 'axis',
          formatter(params: Array<{ axisValue: string; seriesName: string; value: number; marker: string }>) {
            const lines = params.map((item) => {
              if (item.seriesName.includes('金额')) {
                return `${item.marker} ${item.seriesName}: ¥${formatCny(item.value)}`;
              }
              return `${item.marker} ${item.seriesName}: ${formatTokens(item.value)}`;
            });
            return `${params[0]?.axisValue ?? ''}<br/>${lines.join('<br/>')}`;
          },
        },
        legend: { data: legendData, bottom: 0 },
        grid: { left: 52, right: showCostMetrics ? 48 : 24, top: 32, bottom: 52 },
        xAxis: {
          type: 'category',
          data: tokenTrend.map((point) => point.date),
          boundaryGap: false,
          axisLabel: AXIS_LABEL,
        },
        yAxis: showCostMetrics
          ? [
              {
                type: 'value',
                name: 'Token',
                axisLabel: { ...AXIS_LABEL, formatter: (v: number) => `${Math.round(v / 1000)}k` },
                splitLine: { lineStyle: SPLIT_LINE },
              },
              {
                type: 'value',
                name: 'CNY',
                axisLabel: { ...AXIS_LABEL, formatter: (v: number) => `¥${v}` },
                splitLine: { show: false },
              },
            ]
          : {
              type: 'value',
              name: 'Token',
              axisLabel: { ...AXIS_LABEL, formatter: (v: number) => `${Math.round(v / 1000)}k` },
              splitLine: { lineStyle: SPLIT_LINE },
            },
        series,
      },
      true,
    );
  }, [showCostMetrics, tokenTrend]);

  const renderCallChart = useCallback(() => {
    if (!callChartRef.current || callTrend.length === 0) return;
    if (!callChartInst.current) callChartInst.current = echarts.init(callChartRef.current);

    const availableModels = dashboardResult.availableModels;
    const models = modelFilter === 'all' ? availableModels : [modelFilter];
    const multi = models.length > 1;

    callChartInst.current.setOption(
      {
        color: CHART_COLORS,
        animationDuration: 600,
        tooltip: {
          trigger: 'axis',
          formatter(params: Array<{ axisValue: string; seriesName: string; value: number; marker: string }>) {
            const lines = params.map(
              (item) => `${item.marker} ${item.seriesName}: ${formatTokens(item.value)} 次`,
            );
            return `${params[0]?.axisValue ?? ''}<br/>${lines.join('<br/>')}`;
          },
        },
        legend: multi ? { data: models, bottom: 0, type: 'scroll' } : undefined,
        grid: { left: 52, right: 24, top: 32, bottom: multi ? 52 : 28 },
        xAxis: { type: 'category', data: callTrend.map((point) => point.date), axisLabel: AXIS_LABEL },
        yAxis: {
          type: 'value',
          name: '调用次数',
          axisLabel: AXIS_LABEL,
          splitLine: { lineStyle: SPLIT_LINE },
        },
        series: models.map((model) => ({
          name: model,
          type: 'bar',
          barMaxWidth: multi ? 16 : 28,
          data: callTrend.map((point) => Number(point[model] ?? 0)),
          itemStyle: { borderRadius: [4, 4, 0, 0] },
        })),
      },
      true,
    );
  }, [callTrend, dashboardResult.availableModels, modelFilter]);

  useEffect(() => {
    if (tokenTrend.length === 0) {
      tokenChartInst.current?.dispose();
      tokenChartInst.current = null;
    }
    if (callTrend.length === 0) {
      callChartInst.current?.dispose();
      callChartInst.current = null;
    }
  }, [tokenTrend.length, callTrend.length]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      renderTokenChart();
      renderCallChart();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [renderTokenChart, renderCallChart, chartLoading]);

  useEffect(() => {
    const onResize = () => {
      tokenChartInst.current?.resize();
      callChartInst.current?.resize();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const queriedAtText = appliedQuery.queriedAt
    ? appliedQuery.queriedAt.toLocaleString('zh-CN', {
        hour12: false,
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '';

  const balanceRefreshText = balanceRefreshAt?.toLocaleString('zh-CN', {
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
        title="数据看板"
        description="查看系统账户余额与密钥调用消费趋势；账户概览每 5 秒同步运营管理端，下方统计随筛选条件联动刷新。"
      />

      <section className="balance-stat-row" aria-label="系统账户概览">
        <div className="balance-stat-row-head">
          <div className="balance-stat-row-title-block">
            <h5 className="balance-stat-row-title">系统账户概览</h5>
            <span className="balance-stat-row-desc">每 5 秒同步运营管理端最新数据</span>
          </div>
          <div className="balance-refresh-meta">
            <span className="balance-live-dot" aria-hidden />
            <SyncOutlined className="balance-refresh-icon" spin={balancePolling} />
            <span>最近更新 {balanceRefreshText}</span>
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

      <Card bordered={false} className="page-card dashboard-filter-card dashboard-filter-card--compact">
        <div className="dashboard-filter-compact">
          <Form
            form={form}
            layout="vertical"
            className="dashboard-filter-form dashboard-filter-form--compact"
            onFinish={handleSearch}
            initialValues={DEFAULT_QUERY}
          >
            <div className="dashboard-filter-compact-row">
              <Form.Item
                name="keySource"
                label="密钥类型"
                className="dashboard-filter-field"
                rules={[{ required: true, message: '请选择密钥类型' }]}
              >
                <Select
                  placeholder="请选择"
                  options={KEY_SOURCE_OPTIONS}
                  onChange={handleKeySourceChange}
                />
              </Form.Item>

              <Form.Item name="keyName" label="密钥名称" className="dashboard-filter-field">
                <Select
                  allowClear
                  showSearch
                  placeholder="全部密钥"
                  optionFilterProp="label"
                  options={keyNameOptions}
                  optionRender={(option) => (
                    <div className="resource-option">
                      <span>{option.label}</span>
                      {option.data?.desc ? (
                        <span className="resource-option-code">{option.data.desc}</span>
                      ) : null}
                    </div>
                  )}
                />
              </Form.Item>

              <Form.Item
                name="dateRange"
                label="使用时间段"
                className="dashboard-filter-field dashboard-filter-field--range"
                tooltip="精确到时分，不选则统计全部"
              >
                <RangePicker
                  key={dateRangeKey}
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: '100%' }}
                  placeholder={['开始', '结束']}
                  onChange={(value) => handleDateRangeChange(value as [Dayjs, Dayjs] | null)}
                />
              </Form.Item>

              <div className="dashboard-filter-presets">
                <span className="date-presets-label">快捷</span>
                <div className="date-preset-group">
                  {[
                    { days: 0, label: '今天' },
                    { days: 7, label: '近 7 天' },
                    { days: 30, label: '近 30 天' },
                  ].map((preset) => (
                    <button
                      key={preset.days}
                      type="button"
                      className={`date-preset-btn${activeDatePreset === preset.days ? ' is-active' : ''}`}
                      onClick={() => applyDatePreset(preset.days)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="dashboard-filter-actions">
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
                <Button type="primary" icon={<SearchOutlined />} loading={loading} onClick={handleSearch}>
                  查询
                </Button>
              </div>
            </div>
          </Form>

          <div className="dashboard-filter-applied">
            <span className="filter-applied-label">已应用</span>
            <Space size={[4, 4]} wrap className="filter-applied-tags">
              <Tag color="processing" bordered={false}>
                {scopeLabel.source}
              </Tag>
              <Tag bordered={false}>{scopeLabel.name}</Tag>
              <Tag bordered={false} icon={<ClockCircleOutlined />}>
                {scopeLabel.range}
              </Tag>
              {queriedAtText ? (
                <Tag bordered={false} className="filter-code-tag">
                  统计于 {queriedAtText}
                </Tag>
              ) : null}
            </Space>
          </div>
        </div>
      </Card>

      <StatGrid items={statItems} loading={loading} />

      <div className="dashboard-charts">
        <Card bordered={false} className="page-card chart-card">
          <div className="chart-card-header">
            <div>
              <h5 className="chart-card-title">Token 消耗与消费趋势</h5>
              <p className="chart-card-subtitle">
                按当前查询条件统计 · {scopeLabel.range}
                {tokenTrend.length > 0 ? ` · ${tokenTrend.length} 个时间点` : ''}
              </p>
            </div>
          </div>
          <Spin spinning={chartLoading}>
            {tokenTrend.length === 0 ? (
              <Empty className="chart-empty" description="当前查询条件下暂无趋势数据" />
            ) : (
              <div ref={tokenChartRef} className="chart-container" />
            )}
          </Spin>
        </Card>

        <Card bordered={false} className="page-card chart-card">
          <div className="chart-card-header">
            <div>
              <h5 className="chart-card-title">模型调用次数趋势</h5>
              <p className="chart-card-subtitle">
                {modelFilter === 'all' ? '按模型分序列对比' : `展示 ${modelFilter} 调用趋势`}
                {callTrend.length > 0 ? ` · ${scopeLabel.range}` : ''}
              </p>
            </div>
            <Select
              value={modelFilter}
              onChange={setModelFilter}
              options={modelOptions}
              style={{ width: 220 }}
              placeholder="模型筛选"
              disabled={dashboardResult.availableModels.length === 0}
            />
          </div>
          <Spin spinning={chartLoading}>
            {callTrend.length === 0 ? (
              <Empty className="chart-empty" description="当前查询条件下暂无调用趋势数据" />
            ) : (
              <div ref={callChartRef} className="chart-container" />
            )}
          </Spin>
        </Card>
      </div>
    </div>
  );
}
