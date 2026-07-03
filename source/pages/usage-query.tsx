import '../components/page.css';

import React from 'react';

import { PageHeader } from '../components/PageHeader';
import { UsageLogPanel } from '../components/UsageLogPanel';

export default function UsageQueryPage() {
  return (
    <div className="saas-page">
      <PageHeader
        title="用量查询"
        description="查看企业 API 消耗调用记录；系统密钥数据默认每 5 秒自动刷新，自建密钥记录需手动查询。金额保留 3 位小数。"
      />
      <UsageLogPanel showAccountOverview />
    </div>
  );
}
