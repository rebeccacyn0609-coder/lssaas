import React from 'react';

import { AdminPlaceholderPage } from '../../components/admin/AdminPlaceholderPage';

export default function DictionaryPage() {
  return (
    <AdminPlaceholderPage
      title="字典管理"
      description="维护 SaaS 系统字典类型与字典数据。"
      capabilityHint="参考 B 端管理后台：字典分类、键值维护、排序与启用状态等。"
    />
  );
}
