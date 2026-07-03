import React from 'react';

import { SystemAdminPlaceholderPage } from '../components/SystemAdminPlaceholderPage';

export default function SystemRolesPage() {
  return (
    <SystemAdminPlaceholderPage
      title="角色管理"
      description="配置企业内角色与权限，控制工作台功能访问范围。"
      capabilityHint="参考 B 端管理系统：角色列表、权限配置、成员绑定与数据范围等。"
    />
  );
}
