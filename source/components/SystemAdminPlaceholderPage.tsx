import './page.css';

import React from 'react';
import { Card, Empty, Tag } from 'antd';
import { ToolOutlined } from '@ant-design/icons';

import { PageHeader } from './PageHeader';

export function SystemAdminPlaceholderPage({
  title,
  description,
  capabilityHint,
}: {
  title: string;
  description: string;
  capabilityHint: string;
}) {
  return (
    <div className="saas-page">
      <PageHeader title={title} description={description} />
      <Card bordered={false} className="page-card platform-section-card system-admin-placeholder-card">
        <Empty
          className="system-admin-placeholder-empty"
          image={<ToolOutlined className="placeholder-page-icon" />}
          description={(
            <div className="system-admin-placeholder-copy">
              <p>本页面为 <strong>{title}</strong> 功能占位，完整能力对齐通用 B 端管理系统中的同类模块。</p>
              <p className="system-admin-placeholder-hint">{capabilityHint}</p>
              <Tag bordered={false} color="processing">界面待迭代</Tag>
            </div>
          )}
        />
      </Card>
    </div>
  );
}
