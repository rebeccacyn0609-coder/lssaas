import React from 'react';
import { Typography } from 'antd';
import type { ColumnType } from 'antd/es/table';

import { TableEllipsisText } from './tableEllipsisCell';

const { Text } = Typography;

type DateTimeColumnOptions<T> = Partial<ColumnType<T>> & {
  title?: string;
  width?: number;
};

function renderDateTimeCell(value: string | null | undefined) {
  const display = value?.trim() ? value : '—';
  if (display === '—') {
    return <span className="table-cell-time__text">—</span>;
  }
  return (
    <Text className="table-cell-time__text" ellipsis={{ tooltip: true }}>
      {display}
    </Text>
  );
}

/** 列表日期时间列：单行展示，超出省略时悬停气泡 */
export function createDateTimeTableColumn<T>(
  dataIndex: string,
  options: DateTimeColumnOptions<T> = {},
): ColumnType<T> {
  const { title = '时间', width = 172, render: customRender, ...rest } = options;

  return {
    ...rest,
    title,
    dataIndex,
    width,
    className: 'table-col-time',
    onHeaderCell: () => ({ className: 'table-col-time' }),
    onCell: () => ({ className: 'table-cell-time' }),
    render: (value: string, record, index) => {
      if (customRender) {
        return customRender(value, record, index);
      }
      return renderDateTimeCell(value);
    },
  };
}

/** 用量/充值等 time 字段列表列 */
export function createTimeTableColumn<T extends { time: string }>(
  options?: DateTimeColumnOptions<T>,
): ColumnType<T> {
  return createDateTimeTableColumn<T>('time', options);
}

export { TableEllipsisText };
