import React, { useEffect, useState } from "react";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  ApartmentOutlined,
  BookOutlined,
  FileTextOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { Card, Col, Row, Table, Tag, Typography, Spin } from "antd";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getDashboardStatisticsApi } from "../../../services/admin/dashboard/api";
import type { DashboardStatistics } from "../../../services/admin/dashboard/api";
import { fetchCredentialRequestsApi } from "../../../services/admin/credentials/api";
import type { CredentialRequestDto } from "../../../services/admin/credentials/api";
import { fetchClassesApi } from "../../../services/admin/classes/api";
import type { ClassSummary } from "../../../types/Class";
import { fetchSemestersApi } from "../../../services/admin/semesters/api";
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

interface OverviewRecord {
  key: string;
  item: string;
  category: string;
  status: "onTrack" | "warning" | "pending";
  updated: string;
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
  const [semesterStats, setSemesterStats] = useState<
    { name: string; classes: number; students: number }[]
  >([]);

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

        // Load semesters for chart
        const semestersRes = await fetchSemestersApi({
          pageNumber: 1,
          pageSize: 6,
        });
        const semesters = semestersRes.data || [];
        const statsData = semesters.map((semester) => ({
          name: semester.name,
          classes: Math.floor(Math.random() * 20) + 10, // Placeholder - should come from API
          students: Math.floor(Math.random() * 200) + 100, // Placeholder
        }));
        setSemesterStats(statsData);
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

  const overviewData: OverviewRecord[] = [
    ...pendingRequests.slice(0, 3).map((req) => ({
      key: `request-${req.id}`,
      item: `Yêu cầu chứng chỉ - ${req.studentName || "N/A"}`,
      category: "Chứng chỉ",
      status: "pending" as const,
      updated: req.createdAt
        ? dayjs.utc(req.createdAt).utcOffset(7).format("DD/MM/YYYY")
        : "Chưa có ngày",
    })),
    ...recentClasses.slice(0, 2).map((cls) => ({
      key: `class-${cls.id || ""}`,
      item: `Lớp ${cls.classCode || "N/A"}`,
      category: "Lớp học",
      status: "onTrack" as const,
      updated: `${cls.totalStudents} sinh viên`,
    })),
  ];

  const statusTag = (status: OverviewRecord["status"]) => {
    switch (status) {
      case "onTrack":
        return <Tag color="green">Đúng tiến độ</Tag>;
      case "warning":
        return <Tag color="orange">Cảnh báo</Tag>;
      case "pending":
        return <Tag color="blue">Đang xử lý</Tag>;
      default:
        return <Tag>Chưa rõ</Tag>;
    }
  };

  const columns: ColumnsType<OverviewRecord> = [
    {
      title: "Hạng mục",
      dataIndex: "item",
      key: "item",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Nhóm",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (value: OverviewRecord["status"]) => statusTag(value),
    },
    {
      title: "Cập nhật",
      dataIndex: "updated",
      key: "updated",
      render: (text: string) => <Text type="secondary">{text}</Text>,
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
          <Col xs={24} lg={14}>
            <Card className="section-card" bordered={false}>
              <div className="card-title">
                <div>
                  <Text strong>Thống kê theo học kỳ</Text>
                  <Text type="secondary" className="card-description">
                    Số lớp học & Sinh viên qua từng học kỳ
                  </Text>
                </div>
              </div>
              <div className="chart-wrapper">
                {semesterStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={semesterStats} barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#a3a3a3" />
                      <YAxis yAxisId="left" stroke="#a3a3a3" />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#a3a3a3"
                      />
                      <RechartsTooltip />
                      <Bar
                        yAxisId="left"
                        dataKey="classes"
                        name="Lớp học"
                        fill="#1a94fc"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="students"
                        name="Sinh viên"
                        fill="#52c41a"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <Text type="secondary">Chưa có dữ liệu</Text>
                  </div>
                )}
              </div>
          </Card>
        </Col>

          <Col xs={24} lg={10}>
            <Card className="section-card" bordered={false}>
              <div className="card-title">
                <div>
                  <Text strong>Dòng công việc nổi bật</Text>
                  <Text type="secondary" className="card-description">
                    Theo dõi nhanh các nhiệm vụ quan trọng
                  </Text>
                </div>
              </div>
            <Table
                columns={columns}
                dataSource={overviewData}
              pagination={false}
              size="small"
                rowKey="key"
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
