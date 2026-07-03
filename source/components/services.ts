import {
  accountBalance,
  mockApiKeys,
  mockAdminProjectApiKeys,
  mockUsageLogs,
  mockRechargeRecords,
  withApiKeyLastUsed,
  evaluateApiKeyCallable,
  filterUsageLogsForWorkbench,
  formatUsageLogTime,
  resolveApiKeyTestModels,
  resolveUsageLogApiKeySource,
  roundAmountCny,
  type ApiKeyRow,
  type ApiKeySource,
  type ApiKeyTestConnectionRow,
  type ApiKeyTestResult,
  type AdminProjectApiKeyRecord,
  type KeyStatus,
  type UsageLogRow,
  type RechargeRecordRow,
  type AccountAdjustmentType,
  type AccountBalance,
} from './mockData';

export interface ApiKeyQuery {
  name?: string;
  status?: KeyStatus | 'all';
  page?: number;
  pageSize?: number;
}

export interface ApiKeyListSummary {
  total: number;
  enabled: number;
  system: number;
  self: number;
}

export interface SelfApiKeyFormPayload {
  name: string;
  apiBaseUrl: string;
  key: string;
  modelNames: string[];
  remark?: string;
}

/** @deprecated 使用 SelfApiKeyFormPayload */
export type CreateSelfApiKeyPayload = SelfApiKeyFormPayload;

export interface UsageQuery {
  model?: string;
  apiKeyName?: string;
  apiKeySource?: 'all' | ApiKeySource;
  logType?: 'all' | '消耗' | '充值' | '扣款';
  /** 轮询时仅刷新系统密钥相关消耗记录 */
  refreshScope?: 'full' | 'system-only';
}

export interface RechargeQuery {
  recordType?: 'all' | AccountAdjustmentType;
}

export function fetchApiKeys(query: ApiKeyQuery = {}): Promise<{
  rows: ApiKeyRow[];
  total: number;
  summary: ApiKeyListSummary;
  fetchedAt: Date;
}> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      let rows = mockApiKeys.map(withApiKeyLastUsed);
      if (query.name?.trim()) {
        const keyword = query.name.trim().toLowerCase();
        rows = rows.filter((row) => row.name.toLowerCase().includes(keyword));
      }
      if (query.status && query.status !== 'all') {
        rows = rows.filter((row) => row.status === query.status);
      }

      const summary: ApiKeyListSummary = {
        total: rows.length,
        enabled: rows.filter((row) => row.status === 'enabled').length,
        system: rows.filter((row) => row.source === 'system').length,
        self: rows.filter((row) => row.source === 'self').length,
      };

      const page = Math.max(1, query.page ?? 1);
      const pageSize = Math.max(1, query.pageSize ?? 10);
      const start = (page - 1) * pageSize;
      const pagedRows = rows.slice(start, start + pageSize);

      resolve({ rows: pagedRows, total: rows.length, summary, fetchedAt: new Date() });
    }, 280);
  });
}

export function toggleApiKeyStatus(id: string, status: KeyStatus): Promise<ApiKeyRow | null> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const target = mockApiKeys.find((row) => row.id === id);
      if (target) target.status = status;
      resolve(target ? { ...target } : null);
    }, 200);
  });
}

export interface ApiKeySyncPreview {
  toRemove: ApiKeyRow[];
  incremental: AdminProjectApiKeyRecord[];
  addedCount: number;
  removedCount: number;
}

function computeApiKeySyncPlan(): ApiKeySyncPreview {
  const adminIds = new Set(mockAdminProjectApiKeys.map((row) => row.id));
  const localIds = new Set(mockApiKeys.map((row) => row.id));
  const toRemove = mockApiKeys.filter((row) => row.source === 'system' && !adminIds.has(row.id));
  const incremental = mockAdminProjectApiKeys.filter((remote) => !localIds.has(remote.id));
  return {
    toRemove,
    incremental,
    addedCount: incremental.length,
    removedCount: toRemove.length,
  };
}

function appendAdminApiKey(remote: AdminProjectApiKeyRecord) {
  mockApiKeys.push({
    id: remote.id,
    name: remote.name,
    key: remote.key,
    createdAt: remote.createdAt,
    remark: remote.remark,
    apiBaseUrl: remote.apiBaseUrl,
    status: 'enabled',
    lastUsedAt: null,
    adminStatus: remote.adminStatus,
    quotaMode: remote.quotaMode,
    groupName: remote.groupName,
    groupEnabled: remote.groupEnabled,
    channelGroupEnabled: remote.channelGroupEnabled,
    groupMatched: remote.groupMatched,
    source: 'system',
    allowedModels: remote.allowedModels,
    ipWhitelist: remote.ipWhitelist,
  });
}

/** 预览与运营管理端同步差异（不写入） */
export function previewApiKeySyncFromAdmin(): Promise<ApiKeySyncPreview> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(computeApiKeySyncPlan()), 280);
  });
}

/** 执行与运营管理端同步：删除管理端已不存在的系统密钥，并增量追加新密钥 */
export function applyApiKeySyncFromAdmin(): Promise<{
  rows: ApiKeyRow[];
  addedCount: number;
  removedCount: number;
  removedIds: string[];
  fetchedAt: Date;
}> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const plan = computeApiKeySyncPlan();
      const removedIds = plan.toRemove.map((row) => row.id);

      if (removedIds.length > 0) {
        for (let i = mockApiKeys.length - 1; i >= 0; i -= 1) {
          if (removedIds.includes(mockApiKeys[i].id)) {
            mockApiKeys.splice(i, 1);
          }
        }
      }

      plan.incremental.forEach((remote) => appendAdminApiKey(remote));

      resolve({
        rows: mockApiKeys.map(withApiKeyLastUsed),
        addedCount: plan.addedCount,
        removedCount: plan.removedCount,
        removedIds,
        fetchedAt: new Date(),
      });
    }, 600);
  });
}

/** @deprecated 请使用 previewApiKeySyncFromAdmin + applyApiKeySyncFromAdmin */
export function syncApiKeysFromAdmin(): Promise<{
  rows: ApiKeyRow[];
  addedCount: number;
  fetchedAt: Date;
}> {
  return applyApiKeySyncFromAdmin().then((result) => ({
    rows: result.rows,
    addedCount: result.addedCount,
    fetchedAt: result.fetchedAt,
  }));
}

/** 企业自建密钥：写入本地列表，来源固定为「自建」 */
function normalizeSelfKeyModelNames(names: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const name of names) {
    const trimmed = name.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result;
}

export function createSelfBuiltApiKey(payload: SelfApiKeyFormPayload): Promise<ApiKeyRow> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const modelNames = normalizeSelfKeyModelNames(payload.modelNames);
      const createdAt = formatUsageLogTime();
      const row: ApiKeyRow = {
        id: `k-self-${Date.now()}`,
        name: payload.name.trim(),
        key: payload.key.trim(),
        source: 'self',
        status: 'enabled',
        adminStatus: 'enabled',
        quotaMode: 'unlimited',
        groupName: '',
        groupEnabled: true,
        channelGroupEnabled: true,
        groupMatched: true,
        createdAt,
        lastUsedAt: null,
        remark: payload.remark?.trim() || '',
        apiBaseUrl: payload.apiBaseUrl.trim(),
        modelName: modelNames[0],
        allowedModels: modelNames,
        ipWhitelist: '',
      };
      mockApiKeys.unshift(row);
      resolve(withApiKeyLastUsed(row));
    }, 320);
  });
}

/** 更新企业自建密钥（仅 source=self 可编辑） */
export function updateSelfBuiltApiKey(
  id: string,
  payload: SelfApiKeyFormPayload,
): Promise<ApiKeyRow | null> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const target = mockApiKeys.find((row) => row.id === id);
      if (!target || target.source !== 'self') {
        resolve(null);
        return;
      }

      const previousName = target.name;
      const nextName = payload.name.trim();

      const modelNames = normalizeSelfKeyModelNames(payload.modelNames);
      target.name = nextName;
      target.key = payload.key.trim();
      target.apiBaseUrl = payload.apiBaseUrl.trim();
      target.modelName = modelNames[0];
      target.allowedModels = modelNames;
      target.remark = payload.remark?.trim() || '';

      if (previousName !== nextName) {
        mockUsageLogs.forEach((log) => {
          if (log.apiKeyName === previousName) {
            log.apiKeyName = nextName;
          }
        });
      }

      resolve(withApiKeyLastUsed({ ...target }));
    }, 320);
  });
}

/** 拉取密钥当前可测试的模型列表（支持刷新；自建密钥读取最新本地数据） */
export function fetchApiKeyTestModels(id: string): Promise<{
  key: ApiKeyRow;
  models: string[];
  fetchedAt: Date;
}> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      const target = mockApiKeys.find((row) => row.id === id);
      if (!target) {
        reject(new Error('密钥不存在'));
        return;
      }
      resolve({
        key: withApiKeyLastUsed({ ...target }),
        models: resolveApiKeyTestModels(target),
        fetchedAt: new Date(),
      });
    }, 220);
  });
}

/** 对指定模型发起连通测试；成功时各模型写入备注为「密钥测试」的消耗日志 */
export function testApiKeyModels(
  id: string,
  modelNames: string[],
): Promise<ApiKeyTestResult> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const target = mockApiKeys.find((row) => row.id === id);
      const testedAt = formatUsageLogTime();
      const uniqueModels = [...new Set(modelNames.map((name) => name.trim()).filter(Boolean))];

      if (!target) {
        resolve({
          success: false,
          keyName: '',
          rows: uniqueModels.map((modelName) => ({
            modelName,
            durationMs: 0,
            errorMessage: '密钥不存在',
            testedAt,
          })),
          testedAt,
          failureReason: '密钥不存在',
        });
        return;
      }

      if (!uniqueModels.length) {
        resolve({
          success: false,
          keyName: target.name,
          rows: [],
          testedAt,
          failureReason: '请至少选择一个模型',
        });
        return;
      }

      const check = evaluateApiKeyCallable(target);
      if (!check.ok) {
        const errorMessage = mapApiKeyTestFailureMessage(check.reason);
        resolve({
          success: false,
          keyName: target.name,
          rows: uniqueModels.map((modelName) => ({
            modelName,
            durationMs: 0,
            errorMessage,
            testedAt,
          })),
          testedAt,
          failureReason: check.reason,
        });
        return;
      }

      const rows: ApiKeyTestConnectionRow[] = uniqueModels.map((modelName, index) => {
        const durationMs = 186 + Math.floor(Math.random() * 120) + index * 24;
        const tokens = 12;
        const costCny = 0.01;

        mockUsageLogs.unshift({
          id: `ut-${Date.now()}-${index}`,
          type: '消耗',
          time: testedAt,
          model: modelName,
          apiKeyName: target.name,
          tokens,
          costCny,
          durationMs,
          remark: '密钥测试',
          usageOrigin: target.source === 'self' ? 'internal' : 'platform',
        });

        return {
          modelName,
          durationMs,
          errorMessage: '',
          testedAt,
        };
      });

      resolve({
        success: true,
        keyName: target.name,
        rows,
        testedAt,
        message: '连通测试成功',
      });
    }, 520);
  });
}

/** @deprecated 请使用 testApiKeyModels */
export function testApiKeyConnectivity(id: string): Promise<ApiKeyTestResult> {
  const target = mockApiKeys.find((row) => row.id === id);
  const models = target ? resolveApiKeyTestModels(target) : [];
  return testApiKeyModels(id, models);
}

function mapApiKeyTestFailureMessage(reason: string): string {
  if (reason.includes('禁用') || reason.includes('耗尽') || reason.includes('未匹配')) {
    return '渠道 API 密钥配置无效';
  }
  return reason;
}

export function fetchUsageLogs(query: UsageQuery = {}): Promise<{
  rows: UsageLogRow[];
  balance: AccountBalance;
  consumeTotal: number;
  rechargeTotal: number;
  deductTotal: number;
  fetchedAt: Date;
}> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      let rows = [...mockUsageLogs];
      if (query.model?.trim()) {
        const keyword = query.model.trim().toLowerCase();
        rows = rows.filter((row) => row.model.toLowerCase().includes(keyword));
      }
      if (query.apiKeyName?.trim()) {
        const keyword = query.apiKeyName.trim().toLowerCase();
        rows = rows.filter((row) => row.apiKeyName.toLowerCase().includes(keyword));
      }
      if (query.apiKeySource && query.apiKeySource !== 'all') {
        rows = rows.filter((row) => {
          if (row.type !== '消耗' || !row.apiKeyName) {
            return query.apiKeySource === 'system';
          }
          return resolveUsageLogApiKeySource(row.apiKeyName) === query.apiKeySource;
        });
      }
      if (query.logType && query.logType !== 'all') {
        rows = rows.filter((row) => row.type === query.logType);
      }
      rows = filterUsageLogsForWorkbench(rows);
      if (query.refreshScope === 'system-only') {
        rows = rows.filter((row) => {
          if (row.type !== '消耗' || !row.apiKeyName) return true;
          return resolveUsageLogApiKeySource(row.apiKeyName) === 'system';
        });
      }
      const consumeTotal = roundAmountCny(
        rows.filter((row) => row.type === '消耗').reduce((sum, row) => sum + row.costCny, 0),
      );
      const rechargeTotal = roundAmountCny(
        rows.filter((row) => row.type === '充值').reduce((sum, row) => sum + Math.abs(row.costCny), 0),
      );
      const deductTotal = roundAmountCny(
        rows.filter((row) => row.type === '扣款').reduce((sum, row) => sum + Math.abs(row.costCny), 0),
      );
      resolve({
        rows,
        balance: {
          ...accountBalance,
          current: roundAmountCny(accountBalance.current - Math.random() * 0.2),
        },
        consumeTotal,
        rechargeTotal,
        deductTotal,
        fetchedAt: new Date(),
      });
    }, 280);
  });
}

export function fetchRechargeRecords(query: RechargeQuery = {}): Promise<{
  rows: RechargeRecordRow[];
  rechargeTotal: number;
  deductTotal: number;
  balance: AccountBalance;
  fetchedAt: Date;
}> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      let rows = [...mockRechargeRecords];
      if (query.recordType && query.recordType !== 'all') {
        rows = rows.filter((row) => row.type === query.recordType);
      }
      const rechargeTotal = roundAmountCny(
        rows.filter((row) => row.type === '充值').reduce((sum, row) => sum + row.amount, 0),
      );
      const deductTotal = roundAmountCny(
        rows.filter((row) => row.type === '扣款').reduce((sum, row) => sum + row.amount, 0),
      );
      resolve({
        rows,
        rechargeTotal,
        deductTotal,
        balance: {
          ...accountBalance,
          current: roundAmountCny(accountBalance.current - Math.random() * 0.2),
        },
        fetchedAt: new Date(),
      });
    }, 280);
  });
}
