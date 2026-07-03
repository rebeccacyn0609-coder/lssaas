import React from 'react';

import { SystemAdminPlaceholderPage } from '../components/SystemAdminPlaceholderPage';

export default function SystemUsersPage() {
  return (
    <SystemAdminPlaceholderPage
      title="人员管理"
      description="管理企业内成员账号，分配所属部门与角色。"
      capabilityHint="参考 B 端管理系统：成员列表、启用/禁用、关联部门与角色、重置密码等。"
    />
  );
}
