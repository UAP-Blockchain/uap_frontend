import React, { useEffect, useState } from "react";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  ApartmentOutlined,
  BookOutlined,
  FileTextOutlined,
  TeamOutlined,
  UserOutlined,
  CalendarOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { Card, Col, Row, Table, Tag, Typography, Spin } from "antd";
import { getDashboardStatisticsApi } from "../../../services/admin/dashboard/api";
import type { DashboardStatistics } from "../../../services/admin/dashboard/api";
import { fetchCredentialRequestsApi } from "../../../services/admin/credentials/api";
import type { CredentialRequestDto } from "../../../services/admin/credentials/api";
import { fetchClassesApi } from "../../../services/admin/classes/api";
import type { ClassSummary } from "../../../types/Class";
import { fetchActionLogsApi } from "../../../services/admin/actionLogs/api";
import type { ActionLogDto } from "../../../types/ActionLog";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "./index.scss";

// Cấu hình dayjs UTC plugin
dayjs.extend(utc);

const { Title, Text } = Typography;

interface StatCard {
  id: string;
  title: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  accent: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}


const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(
    null
  );
  const [pendingRequests, setPendingRequests] = useState<
    CredentialRequestDto[]
  >([]);
  const [recentClasses, setRecentClasses] = useState<ClassSummary[]>([]);
  const [actionLogs, setActionLogs] = useState<ActionLogDto[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Load statistics
        const stats = await getDashboardStatisticsApi();
        setStatistics(stats);

        // Load pending credential requests
        const requestsRes = await fetchCredentialRequestsApi({
          page: 1,
          pageSize: 5,
          status: "Pending",
        });
        setPendingRequests(requestsRes.items || []);

        // Load recent classes
        const classesRes = await fetchClassesApi({
          page: 1,
          pageSize: 6,
        });
        setRecentClasses(classesRes.items || []);

        // Load recent action logs
        const logsRes = await fetchActionLogsApi({
          page: 1,
          pageSize: 10, // Show latest 10 action logs
        });
        setActionLogs(logsRes.items || []);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const currentDate = new Date().toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const statCards: StatCard[] = statistics
    ? [
        {
          id: "specializations",
          title: "Chuyên ngành",
          value: statistics.activeSpecializations.toString(),
          subtext: "Đang hoạt động",
          icon: <ApartmentOutlined />,
          accent: "#6366f1",
    },
    {
          id: "classes",
          title: "Lớp học",
          value: statistics.activeClasses.toString(),
          subtext: "Đang hoạt động",
          icon: <BookOutlined />,
          accent: "#22c55e",
    },
    {
          id: "subjects",
          title: "Môn học",
          value: statistics.activeSubjects.toString(),
          subtext: "Đang hoạt động",
          icon: <FileTextOutlined />,
          accent: "#0ea5e9",
        },
        {
          id: "teachers",
          title: "Giáo viên",
          value: statistics.activeTeachers.toString(),
          subtext: "Đang hoạt động",
          icon: <TeamOutlined />,
          accent: "#f97316",
        },
        {
          id: "students",
          title: "Sinh viên",
          value: statistics.activeStudents.toString(),
          subtext: "Đang hoạt động",
          icon: <UserOutlined />,
          accent: "#14b8a6",
    },
      ]
    : [];

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

  const actionLogColumns: ColumnsType<ActionLogDto> = [
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (date: string) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <CalendarOutlined style={{ color: "#8c8c8c", fontSize: 12 }} />
          <Text type="secondary" style={{ fontSize: 13 }}>
            {dayjs.utc(date).add(7, "hour").format("DD/MM/YYYY HH:mm")}
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
            <Text type="secondary" style={{ fontSize: 12 }}>
              {summary || detail.substring(0, 50)}
            </Text>
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
  ];

  const renderTrend = (trend?: StatCard["trend"]) => {
    if (!trend) return null;

    return (
      <div
        className={`trend-indicator ${
          trend.isPositive ? "positive" : "negative"
        }`}
      >
        {trend.isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
        <span>{trend.value}</span>
      </div>
    );
  };

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <div>
          <Title level={3}>Tổng quan hệ thống</Title>
          <Text type="secondary">Cập nhật ngày {currentDate}</Text>
        </div>
        <div className="header-meta">
          <Text strong>Vai trò: Quản trị viên</Text>
          <span className="dot" />
          <Text type="secondary">{pendingRequests.length} đơn chờ duyệt</Text>
        </div>
      </div>

      <Spin spinning={loading}>
        <div className="stats-grid">
          {statCards.map((card) => (
            <Card className="stat-card" bordered={false} key={card.id}>
              <div
                className="stat-icon"
                style={{ background: `${card.accent}15`, color: card.accent }}
              >
                {card.icon}
              </div>
              <div className="stat-info">
                <Text className="stat-label">{card.title}</Text>
                <div className="stat-value" style={{ color: card.accent }}>
                  {card.value}
                </div>
                <Text type="secondary" className="stat-subtext">
                  {card.subtext}
                </Text>
              </div>
              {renderTrend(card.trend)}
          </Card>
          ))}
                </div>

        <Row gutter={[24, 24]} className="dashboard-main">
          <Col xs={24} lg={24}>
            <Card className="section-card" bordered={false}>
              <div className="card-title">
                <div>
                  <Text strong>
                    <HistoryOutlined style={{ marginRight: 8 }} />
                    Nhật ký hoạt động
                  </Text>
                  <Text type="secondary" className="card-description">
                    Các hoạt động gần đây trong hệ thống
                  </Text>
                </div>
              </div>
            <Table
                columns={actionLogColumns}
                dataSource={actionLogs}
              pagination={false}
              size="small"
                rowKey="id"
                className="overview-table"
            />
          </Card>
        </Col>
      </Row>
      </Spin>
    </div>
  );
};

export default Dashboard;
