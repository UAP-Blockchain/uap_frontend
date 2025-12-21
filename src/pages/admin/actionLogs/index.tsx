import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Card,
  Input,
  Select,
  DatePicker,
  Tag,
  Row,
  Col,
  Typography,
  Spin,
  Button,
  Modal,
  Descriptions,
  Tooltip,
  message,
  Empty,
} from "antd";
import {
  EyeOutlined,
  ReloadOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { ActionLogDto, ActionLogFilter } from "../../../types/ActionLog";
import { fetchActionLogsApi } from "../../../services/admin/actionLogs/api";
import dayjs from "dayjs";
import "./index.scss";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

const ActionLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<ActionLogDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [viewingLog, setViewingLog] = useState<ActionLogDto | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // Filters
  const [searchText, setSearchText] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  );

  // Ref to prevent multiple API calls
  const isInitialMount = useRef(true);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const actionTypes = [
    "all",
    "ISSUE_CREDENTIAL",
    "SUBMIT_GRADE",
    "UPDATE_GRADE",
    "DELETE_GRADE",
    "USER_LOGIN",
    "USER_LOGOUT",
    "USER_CREATED",
    "PASSWORD_RESET",
    "CREATE_CLASS",
    "UPDATE_SCHEDULE",
    "CANCEL_SLOT",
    "VERIFY_CREDENTIAL",
    "REVOKE_CREDENTIAL",
    "BLOCKCHAIN_STORE",
  ];

  // Fetch logs
  const fetchLogs = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const filter: ActionLogFilter = {
        page,
        pageSize,
        action: actionFilter !== "all" ? actionFilter : undefined,
        searchText: searchText || undefined,
        dateFrom: dateRange?.[0]?.toISOString(),
        dateTo: dateRange?.[1]?.toISOString(),
        // Note: hasBlockchain filter will be applied on frontend
        // Backend doesn't support this filter yet
      };

      const response = await fetchActionLogsApi(filter);

      setLogs(response.items);
      setPagination({
        current: response.page,
        pageSize: response.pageSize,
        total: response.totalCount,
      });
    } catch (error: unknown) {
      console.error("Error fetching action logs:", error);
      const errorMessage =
        (
          error as {
            response?: { data?: { detail?: string; message?: string } };
          }
        )?.response?.data?.detail ||
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Không thể tải nhật ký hoạt động";
      message.error(errorMessage);
      // Set empty state on error
      setLogs([]);
      setPagination({
        current: 1,
        pageSize: pagination.pageSize,
        total: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial load - only run once
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchLogs(1, pagination.pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search and filters
  useEffect(() => {
    // Skip initial mount
    if (isInitialMount.current) {
      return;
    }

    // Clear previous timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Set new timeout
    fetchTimeoutRef.current = setTimeout(() => {
      fetchLogs(1, pagination.pageSize);
    }, 500);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, actionFilter, dateRange]);

  const handleViewDetail = async (log: ActionLogDto) => {
    try {
      // Since backend doesn't have get by ID endpoint yet,
      // use the log data directly from the list
      setViewingLog(log);
      setIsDetailModalVisible(true);

      // TODO: When backend adds get by ID endpoint, use this:
      // const detail = await getActionLogByIdApi(log.id);
      // setViewingLog(detail);
    } catch (error: unknown) {
      console.error("Error fetching log detail:", error);
      const errorMessage =
        (error as { message?: string })?.message ||
        "Không thể tải chi tiết nhật ký hoạt động";
      message.error(errorMessage);
    }
  };

  const handleRefresh = () => {
    fetchLogs(pagination.current, pagination.pageSize);
  };

  const getActionTag = (action: string) => {
    const colorMap: Record<string, string> = {
      ISSUE_CREDENTIAL: "green",
      SUBMIT_GRADE: "blue",
      UPDATE_GRADE: "orange",
      DELETE_GRADE: "red",
      USER_LOGIN: "cyan",
      USER_LOGOUT: "default",
      USER_CREATED: "purple",
      PASSWORD_RESET: "volcano",
      CREATE_CLASS: "geekblue",
      UPDATE_SCHEDULE: "lime",
      CANCEL_SLOT: "red",
      VERIFY_CREDENTIAL: "success",
      REVOKE_CREDENTIAL: "error",
      BLOCKCHAIN_STORE: "processing",
    };

    return (
      <Tag color={colorMap[action] || "default"} style={{ fontWeight: 500 }}>
        {action.replace(/_/g, " ")}
      </Tag>
    );
  };

  const getRoleTag = (role?: string) => {
    const colorMap: Record<string, string> = {
      Admin: "red",
      Teacher: "blue",
      Student: "green",
    };

    return role ? <Tag color={colorMap[role] || "default"}>{role}</Tag> : null;
  };

  const columns: ColumnsType<ActionLogDto> = [
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: string) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <CalendarOutlined style={{ color: "#8c8c8c", fontSize: 12 }} />
          <Text type="secondary" style={{ fontSize: 13 }}>
            {dayjs(date).format("DD/MM/YYYY HH:mm")}
          </Text>
        </div>
      ),
    },
    {
      title: "Hành động",
      dataIndex: "action",
      key: "action",
      width: 200,
      render: (action: string) => getActionTag(action),
    },
    {
      title: "Người thực hiện",
      key: "user",
      width: 220,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <UserOutlined style={{ color: "#8c8c8c" }} />
          <div>
            <div style={{ fontWeight: 500, fontSize: 13 }}>
              {record.userName || "N/A"}
            </div>
            <div style={{ fontSize: 12, color: "#8c8c8c" }}>
              {record.userEmail || ""}
            </div>
            {getRoleTag(record.userRole)}
          </div>
        </div>
      ),
    },
    {
      title: "Chi tiết",
      dataIndex: "detail",
      key: "detail",
      ellipsis: true,
      render: (detail: string | null | undefined) => {
        if (!detail) {
          return (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Không có chi tiết
            </Text>
          );
        }
        try {
          const parsed = JSON.parse(detail);
          const summary = Object.entries(parsed)
            .slice(0, 2)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ");
          return (
            <Tooltip title={summary}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {summary || detail.substring(0, 50)}
              </Text>
            </Tooltip>
          );
        } catch {
          return (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {detail.substring(0, 50)}...
            </Text>
          );
        }
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="action-logs-page">
      {/* Main Panel */}
      <Card className="logs-panel" bordered={false}>
        <div className="overview-header">
          <div className="title-block">
            <div className="title-icon">
              <FileTextOutlined />
            </div>
            <div>
              <div className="eyebrow">Quản lý</div>
              <h2>Danh sách nhật ký</h2>
              <div className="subtitle">
                {pagination.total} bản ghi được tìm thấy
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              Làm mới
            </Button>
            <Button icon={<ExportOutlined />} disabled>
              Xuất Excel
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-row">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <div className="filter-field">
                <label>Tìm kiếm</label>
                <Search
                  placeholder="Tìm kiếm theo action, user, detail..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  style={{ width: "100%" }}
                  enterButton="Tìm kiếm"
                  onSearch={(value) => {
                    setSearchText(value);
                    fetchLogs(1, pagination.pageSize);
                  }}
                />
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="filter-field">
                <label>Loại hành động</label>
                <Select
                  value={actionFilter}
                  onChange={setActionFilter}
                  style={{ width: "100%" }}
                  placeholder="Tất cả"
                >
                  {actionTypes.map((action) => (
                    <Option key={action} value={action}>
                      {action === "all" ? "Tất cả" : action.replace(/_/g, " ")}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="filter-field">
                <label>Khoảng thời gian</label>
                <RangePicker
                  value={dateRange}
                  onChange={(dates) =>
                    setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)
                  }
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                />
              </div>
            </Col>
          </Row>
        </div>

        {/* Table */}
        <div className="table-section">
          <Spin spinning={loading}>
            {logs.length === 0 && !loading ? (
              <Empty
                description="Không có dữ liệu nhật ký hoạt động"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Table
                columns={columns}
                dataSource={logs}
                rowKey="id"
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng ${total} bản ghi`,
                  onChange: (page, pageSize) => {
                    fetchLogs(page, pageSize);
                  },
                }}
                scroll={{ x: 1200 }}
                className="action-logs-table"
              />
            )}
          </Spin>
        </div>
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết nhật ký hoạt động"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {viewingLog && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="ID">{viewingLog.id}</Descriptions.Item>
            <Descriptions.Item label="Thời gian">
              {dayjs(viewingLog.createdAt).format("DD/MM/YYYY HH:mm:ss")}
            </Descriptions.Item>
            <Descriptions.Item label="Hành động">
              {getActionTag(viewingLog.action)}
            </Descriptions.Item>
            <Descriptions.Item label="Người thực hiện">
              <div>
                <div>{viewingLog.userName || "N/A"}</div>
                <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                  {viewingLog.userEmail}
                </div>
                {getRoleTag(viewingLog.userRole)}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Chi tiết">
              <pre
                style={{
                  background: "#f5f5f5",
                  padding: 12,
                  borderRadius: 4,
                  fontSize: 12,
                  maxHeight: 300,
                  overflow: "auto",
                }}
              >
                {viewingLog.detail ? (
                  (() => {
                    try {
                      return JSON.stringify(
                        JSON.parse(viewingLog.detail),
                        null,
                        2
                      );
                    } catch {
                      return viewingLog.detail;
                    }
                  })()
                ) : (
                  <Text type="secondary">Không có chi tiết</Text>
                )}
              </pre>
            </Descriptions.Item>
            {viewingLog.transactionHash && (
              <>
                <Descriptions.Item label="Transaction Hash">
                  <Text code copyable>
                    {viewingLog.transactionHash}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Block Number">
                  {viewingLog.blockNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Event Name">
                  {viewingLog.eventName}
                </Descriptions.Item>
                <Descriptions.Item label="From">
                  <Text code copyable>
                    {viewingLog.txFrom}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="To">
                  <Text code copyable>
                    {viewingLog.txTo}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Contract Address">
                  <Text code copyable>
                    {viewingLog.contractAddress}
                  </Text>
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ActionLogsPage;
