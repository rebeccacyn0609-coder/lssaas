import React from 'react';

import { AdminPlaceholderPage } from '../../components/admin/AdminPlaceholderPage';

export default function TenantListPage() {
  return (
    <AdminPlaceholderPage
      title="租户列表"
      description="查看与管理 SaaS 系统租户，维护租户基础信息与状态。"
      capabilityHint="参考 B 端管理后台：租户检索、启用/停用、套餐关联、额度与到期时间等。"
    />
  );
}
