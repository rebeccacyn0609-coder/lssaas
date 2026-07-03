import { formatCny, type UsageLogRow } from './mockData';
import { formatUsageLogRowForExport } from './usageLogDisplay';

function escapeCsvCell(value: string | number): string {
  const str = String(value ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatRow(cells: Array<string | number>): string {
  return cells.map(escapeCsvCell).join(',');
}

/** 文件名后缀：YYYYMMDDHHmm */
export function formatExportFileTimestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
  ].join('');
}

/** 模板内展示的导出时间 */
export function formatExportDisplayTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function sanitizeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '_').trim() || '密钥';
}

export interface ExportKeyUsageLogsOptions {
  apiKeyName: string;
  rows: UsageLogRow[];
  consumeTotal: number | null;
  exportedAt?: Date;
}

export function buildKeyUsageLogCsv({
  apiKeyName,
  rows,
  consumeTotal,
  exportedAt = new Date(),
}: ExportKeyUsageLogsOptions): string {
  const exportTime = formatExportDisplayTime(exportedAt);
  const lines: string[] = [
    formatRow(['导出时间', exportTime]),
    formatRow(['密钥名称', apiKeyName]),
    '',
    formatRow(['类型', '时间', '模型', 'tokens', '费用（CNY）', '耗时', '详情/备注']),
    ...rows.map((row) => {
      const cells = formatUsageLogRowForExport(row);
      return formatRow([
        row.type,
        row.time,
        cells.model,
        cells.tokens,
        cells.cost,
        cells.duration,
        row.remark,
      ]);
    }),
    '',
    formatRow(['消耗费用共计', consumeTotal === null ? '—' : `¥${formatCny(consumeTotal)}`]),
  ];
  return `\uFEFF${lines.join('\r\n')}`;
}

export function downloadKeyUsageLogCsv(options: ExportKeyUsageLogsOptions): string {
  const exportedAt = options.exportedAt ?? new Date();
  const fileName = `${sanitizeFileName(options.apiKeyName)}${formatExportFileTimestamp(exportedAt)}.csv`;
  const content = buildKeyUsageLogCsv({ ...options, exportedAt });
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
  return fileName;
}
