import React from 'react';
import { Tag, Typography } from 'antd';

const { Text } = Typography;

type TableEllipsisTextProps = {
  value?: string | null;
  className?: string;
  emptyText?: string;
};

/** 表格单元格：超出宽度省略，悬停气泡展示完整内容 */
export function TableEllipsisText({
  value,
  className,
  emptyText = '—',
}: TableEllipsisTextProps) {
  const text = value?.trim() ? value.trim() : emptyText;
  if (text === emptyText) {
    return <span className={className}>{emptyText}</span>;
  }
  return (
    <Text className={className} ellipsis={{ tooltip: true }}>
      {text}
    </Text>
  );
}

/** 模型列：保留 Tag 样式，长名称省略并可悬停查看 */
export function TableEllipsisModelTag({ model }: { model: string }) {
  const text = model?.trim() || '—';
  if (text === '—') return <span>—</span>;
  return (
    <Tag className="model-tag usage-log-model-tag">
      <Text ellipsis={{ tooltip: true }} className="usage-log-model-tag__text">
        {text}
      </Text>
    </Tag>
  );
}
