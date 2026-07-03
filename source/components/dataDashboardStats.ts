import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import {
  API_KEY_SOURCE_LABELS,
  filterUsageLogsForWorkbench,
  mockApiKeys,
  mockUsageLogs,
  resolveUsageLogApiKeySource,
  roundAmountCny,
  type ApiKeySource,
} from './mockData';

export type KeySourceFilter = 'all' | ApiKeySource;

export interface DataDashboardQuery {
  keySource: KeySourceFilter;
  keyName?: string;
  dateRange: [Dayjs, Dayjs] | null;
}

export interface DataDashboardStats {
  totalTokens: number;
  /** 自建密钥范围或无系统密钥可计费时为 null */
  totalCost: number | null;
  totalCalls: number;
}

export interface TokenTrendPoint {
  date: string;
  tokens: number;
  costCny: number;
}

export interface CallTrendPoint {
  date: string;
  [model: string]: string | number;
}

export interface DataDashboardResult {
  stats: DataDashboardStats;
  tokenTrend: TokenTrendPoint[];
  callTrend: CallTrendPoint[];
  availableModels: string[];
}

interface DailyConsumeRecord {
  at: Dayjs;
  apiKeyName: string;
  model: string;
  tokens: number;
  costCny: number;
}

const DAY_COUNT = 35;

function parseLogTime(time: string): Dayjs {
  return dayjs(time.replace(/-/g, '/'));
}

function buildSyntheticDailyRecords(): DailyConsumeRecord[] {
  const records: DailyConsumeRecord[] = [];
  const today = dayjs().startOf('day');

  mockApiKeys.forEach((key, keyIndex) => {
    if (key.status !== 'enabled') return;
    const models = key.source === 'self'
      ? (key.allowedModels.length ? key.allowedModels : [key.modelName ?? 'gpt-4o-mini'])
      : (key.allowedModels.length ? key.allowedModels : ['gpt-4o-mini', 'gpt-4o']);
    const tokenBase = 3200 + keyIndex * 900;
    const costBase = 1.2 + keyIndex * 0.35;
    const wave = key.source === 'system' ? 1 : 0.75;

    for (let offset = DAY_COUNT - 1; offset >= 0; offset -= 1) {
      const at = today.subtract(offset, 'day').hour(12);
      const dayIndex = DAY_COUNT - 1 - offset;
      const factor = 1 + (dayIndex % 4) * 0.1 + (dayIndex % 3) * 0.06;

      models.forEach((model, modelIndex) => {
        const modelFactor = 1 / models.length + modelIndex * 0.05;
        const isSelf = key.source === 'self';
        records.push({
          at,
          apiKeyName: key.name,
          model,
          tokens: Math.round(tokenBase * factor * wave * modelFactor),
          costCny: isSelf ? 0 : roundAmountCny(costBase * factor * wave * modelFactor),
        });
      });
    }
  });

  return records;
}

function buildObservedDailyRecords(): DailyConsumeRecord[] {
  const logs = filterUsageLogsForWorkbench(mockUsageLogs).filter((row) => row.type === '消耗');
  return logs.map((row) => ({
    at: parseLogTime(row.time),
    apiKeyName: row.apiKeyName,
    model: row.model,
    tokens: row.tokens,
    costCny: resolveUsageLogApiKeySource(row.apiKeyName) === 'self' ? 0 : row.costCny,
  }));
}

const SYNTHETIC_DAILY_RECORDS = buildSyntheticDailyRecords();
const OBSERVED_DAILY_RECORDS = buildObservedDailyRecords();

function mergeDailyRecords(): DailyConsumeRecord[] {
  const map = new Map<string, DailyConsumeRecord>();
  [...SYNTHETIC_DAILY_RECORDS, ...OBSERVED_DAILY_RECORDS].forEach((record) => {
    const key = `${record.at.format('YYYY-MM-DD')}|${record.apiKeyName}|${record.model}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...record });
      return;
    }
    existing.tokens += record.tokens;
    existing.costCny = roundAmountCny(existing.costCny + record.costCny);
  });
  return [...map.values()];
}

const ALL_DAILY_RECORDS = mergeDailyRecords();

function inQueryDateRange(at: Dayjs, dateRange: [Dayjs, Dayjs] | null): boolean {
  if (!dateRange?.[0] || !dateRange?.[1]) return true;
  const ts = at.valueOf();
  return ts >= dateRange[0].valueOf() && ts <= dateRange[1].valueOf();
}

function matchKeySource(apiKeyName: string, keySource: KeySourceFilter): boolean {
  if (keySource === 'all') return true;
  return resolveUsageLogApiKeySource(apiKeyName) === keySource;
}

function filterRecords(query: DataDashboardQuery): DailyConsumeRecord[] {
  const nameKeyword = query.keyName?.trim().toLowerCase() ?? '';

  return ALL_DAILY_RECORDS.filter((record) => {
    if (!matchKeySource(record.apiKeyName, query.keySource)) return false;
    if (nameKeyword && !record.apiKeyName.toLowerCase().includes(nameKeyword)) return false;
    if (!inQueryDateRange(record.at, query.dateRange)) return false;
    return true;
  });
}

function isSelfOnlyScope(query: DataDashboardQuery): boolean {
  if (query.keySource === 'self') return true;
  const name = query.keyName?.trim();
  if (name && resolveUsageLogApiKeySource(name) === 'self') return true;
  return false;
}

function computeBillableTotalCost(
  records: DailyConsumeRecord[],
  query: DataDashboardQuery,
): number | null {
  if (isSelfOnlyScope(query)) return null;

  const billableRecords = records.filter(
    (record) => resolveUsageLogApiKeySource(record.apiKeyName) !== 'self',
  );
  if (records.length > 0 && billableRecords.length === 0) return null;

  return roundAmountCny(billableRecords.reduce((sum, row) => sum + row.costCny, 0));
}

function formatChartDate(at: Dayjs): string {
  return at.format('MM-DD');
}

export function computeDataDashboard(query: DataDashboardQuery): DataDashboardResult {
  const records = filterRecords(query);
  const costBillable = !isSelfOnlyScope(query);

  if (records.length === 0) {
    return {
      stats: { totalTokens: 0, totalCost: costBillable ? 0 : null, totalCalls: 0 },
      tokenTrend: [],
      callTrend: [],
      availableModels: [],
    };
  }

  const totalTokens = records.reduce((sum, row) => sum + row.tokens, 0);
  const totalCost = computeBillableTotalCost(records, query);
  const totalCalls = records.length;

  const dayMap = new Map<string, { at: Dayjs; tokens: number; costCny: number; models: Record<string, number> }>();

  records.forEach((record) => {
    const key = record.at.format('YYYY-MM-DD');
    const bucket = dayMap.get(key) ?? {
      at: record.at.startOf('day'),
      tokens: 0,
      costCny: 0,
      models: {},
    };
    bucket.tokens += record.tokens;
    if (resolveUsageLogApiKeySource(record.apiKeyName) !== 'self') {
      bucket.costCny = roundAmountCny(bucket.costCny + record.costCny);
    }
    bucket.models[record.model] = (bucket.models[record.model] ?? 0) + 1;
    dayMap.set(key, bucket);
  });

  const sortedDays = [...dayMap.values()].sort((a, b) => a.at.valueOf() - b.at.valueOf());
  const availableModels = [...new Set(records.map((row) => row.model))].sort();

  return {
    stats: { totalTokens, totalCost, totalCalls },
    tokenTrend: sortedDays.map((day) => ({
      date: formatChartDate(day.at),
      tokens: day.tokens,
      costCny: day.costCny,
    })),
    callTrend: sortedDays.map((day) => {
      const point: CallTrendPoint = { date: formatChartDate(day.at) };
      availableModels.forEach((model) => {
        point[model] = day.models[model] ?? 0;
      });
      return point;
    }),
    availableModels,
  };
}

export function getDataDashboardKeyNameOptions(keySource: KeySourceFilter = 'all') {
  return mockApiKeys
    .filter((key) => keySource === 'all' || key.source === keySource)
    .map((key) => ({
      value: key.name,
      label: key.name,
      desc: API_KEY_SOURCE_LABELS[key.source],
    }));
}

export function formatDashboardDateRange(range: [Dayjs, Dayjs] | null): string {
  if (!range) return '全部时间';
  return `${range[0].format('MM-DD HH:mm')} ~ ${range[1].format('MM-DD HH:mm')}`;
}
