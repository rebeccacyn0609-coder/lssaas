import {
  loadApplyRecords,
  syncApplyProcessStatusFromOps,
  type EnterpriseApplyProcessStatus,
  type StoredApplyRecord,
  type SyncApplyStatusResult,
} from '../mockData';

export type EnterpriseApplicationProcessFilter = 'all' | EnterpriseApplyProcessStatus;

export interface EnterpriseApplicationQuery {
  processStatus?: EnterpriseApplicationProcessFilter;
  companyName?: string;
}

export function filterEnterpriseApplications(
  records: StoredApplyRecord[],
  query: EnterpriseApplicationQuery = {},
): StoredApplyRecord[] {
  const status = query.processStatus ?? 'all';
  const nameKeyword = query.companyName?.trim().toLowerCase() ?? '';

  return records.filter((record) => {
    if (status !== 'all' && record.processStatus !== status) return false;
    if (nameKeyword && !record.companyName.toLowerCase().includes(nameKeyword)) return false;
    return true;
  });
}

export function fetchEnterpriseApplications(
  query: EnterpriseApplicationQuery = {},
): Promise<StoredApplyRecord[]> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(filterEnterpriseApplications(loadApplyRecords(), query));
    }, 200);
  });
}

export function syncEnterpriseApplicationStatus(): Promise<SyncApplyStatusResult> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(syncApplyProcessStatusFromOps());
    }, 420);
  });
}
