import React from 'react';

import { SystemAdminPlaceholderPage } from '../components/SystemAdminPlaceholderPage';

export default function SystemDepartmentsPage() {
  return (
    <SystemAdminPlaceholderPage
      title="部门管理"
      description="维护企业组织架构，支持部门树形结构与层级关系。"
      capabilityHint="参考 B 端管理系统：部门树、新增/编辑/停用部门、上级部门与排序等。"
    />
  );
}
