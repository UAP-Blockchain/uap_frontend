import type { TableProps } from "antd";
import { Table } from "antd";
import { useState } from "react";
interface CTableProps<T> extends TableProps<T> {
  isPagination?: boolean;
  onPageChange?: (page: number, pageSize: number) => void;
  totalItems?: number;
  defaultPageSize?: number;
}
function CTable<T extends object>(props: CTableProps<T>) {
  const {
    columns,
    dataSource,
    isPagination = false,
    totalItems,
    onPageChange,
    defaultPageSize = 10,
    ...rest
  } = props;
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const sttColumn = {
    title: "STT",
    dataIndex: "stt",
    key: "stt",
    render: (_: unknown, __: T, index: number) => {
      return (currentPage - 1) * pageSize + index + 1;
    },
  };

  const updatedColumns = [sttColumn, ...(columns || [])];

  return (
    <Table
      {...rest}
      columns={updatedColumns}
      dataSource={dataSource}
      pagination={
        isPagination
          ? {
              current: currentPage,
              pageSize: pageSize,
              total: totalItems || dataSource?.length,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} dòng`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size || 5);
                if (onPageChange) {
                  onPageChange(page, size || 5);
                }
              },
            }
          : false
      }
    />
  );
}

export default CTable;
