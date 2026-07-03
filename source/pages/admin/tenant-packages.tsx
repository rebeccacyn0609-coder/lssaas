import React from 'react';

import { AdminPlaceholderPage } from '../../components/admin/AdminPlaceholderPage';

export default function TenantPackagesPage() {
  return (
    <AdminPlaceholderPage
      title="租户套餐"
      description="维护 SaaS 租户套餐类型与能力配置。"
      capabilityHint="参考 B 端管理后台：套餐定义、功能模块、配额策略、版本与定价等。"
    />
  );
}
