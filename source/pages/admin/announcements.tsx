import React from 'react';

import { AdminPlaceholderPage } from '../../components/admin/AdminPlaceholderPage';

export default function AnnouncementsPage() {
  return (
    <AdminPlaceholderPage
      title="通知公告"
      description="面向租户或全平台发布通知与公告。"
      capabilityHint="参考 B 端管理后台：公告发布、可见范围、置顶、有效期与阅读统计等。"
    />
  );
}
