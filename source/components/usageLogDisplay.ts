import type { UsageLogRow, UsageLogType } from './mockData';
import { formatCny, formatTokens, resolveUsageLogApiKeySource, roundAmountCny } from './mockData';

/** 充值 / 扣款：模型、耗时、tokens 不展示业务值 */
export function isBalanceAdjustmentLog(type: UsageLogType): boolean {
  return type === '充值' || type === '扣款';
}

/** 自建密钥消耗记录不计费展示 */
export function isSelfBuiltUsageConsumeRow(row: UsageLogRow): boolean {
  return row.type === '消耗' && resolveUsageLogApiKeySource(row.apiKeyName) === 'self';
}

export function formatUsageLogModel(value: string, type: UsageLogType): string {
  if (isBalanceAdjustmentLog(type)) return '—';
  return value || '—';
}

export function formatUsageLogDuration(durationMs: number, type: UsageLogType): string {
  if (isBalanceAdjustmentLog(type)) return '—';
  return `${durationMs} ms`;
}

export function formatUsageLogTokens(tokens: number, type: UsageLogType): string {
  if (isBalanceAdjustmentLog(type)) return '—';
  return formatTokens(tokens);
}

export function formatUsageLogApiKeyName(value: string, type: UsageLogType): string {
  if (isBalanceAdjustmentLog(type)) return value?.trim() ? value : '—';
  return value || '—';
}

export function formatUsageLogCost(costCny: number, type: UsageLogType, row?: UsageLogRow): string {
  if (row && isSelfBuiltUsageConsumeRow(row)) return '—';
  if (type === '充值') return `+¥${formatCny(Math.abs(costCny))}`;
  if (type === '扣款') return `−¥${formatCny(Math.abs(costCny))}`;
  return `¥${formatCny(costCny)}`;
}

/** 列表消耗费用合计；仅统计系统密钥，全部为自建时返回 null */
export function computeUsageConsumeTotal(rows: UsageLogRow[]): number | null {
  const consumeRows = rows.filter((row) => row.type === '消耗');
  const billableRows = consumeRows.filter((row) => !isSelfBuiltUsageConsumeRow(row));
  if (consumeRows.length > 0 && billableRows.length === 0) return null;
  return roundAmountCny(billableRows.reduce((sum, row) => sum + row.costCny, 0));
}

export function usageLogCostTone(type: UsageLogType): 'positive' | 'negative' | 'default' {
  if (type === '充值') return 'positive';
  if (type === '扣款') return 'negative';
  return 'default';
}

export function formatUsageLogRowForExport(row: UsageLogRow): {
  model: string;
  tokens: string;
  cost: string;
  duration: string;
} {
  return {
    model: formatUsageLogModel(row.model, row.type),
    tokens: formatUsageLogTokens(row.tokens, row.type),
    cost: formatUsageLogCost(row.costCny, row.type, row),
    duration: formatUsageLogDuration(row.durationMs, row.type),
  };
}
