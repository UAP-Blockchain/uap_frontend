import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  BarChartOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  FlagOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { Card, Col, Row, Table, Tag, Typography } from "antd";
import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./Dashboard.scss";

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

const statCards: StatCard[] = [
  {
    id: "progress",
    title: "Tiến độ lộ trình",
    value: "72%",
    subtext: "Hoàn thành 23 / 32 môn",
    icon: <FlagOutlined />,
    accent: "#0ea5e9",
    trend: { value: "+11%", isPositive: true },
  },
  {
    id: "gpa",
    title: "GPA hiện tại",
    value: "3.42",
    subtext: "Mục tiêu ≥ 3.2",
    icon: <BarChartOutlined />,
    accent: "#6366f1",
    trend: { value: "+0.15", isPositive: true },
  },
  {
    id: "attendance",
    title: "Điểm danh",
    value: "95%",
    subtext: "Đạt yêu cầu tất cả môn",
    icon: <CalendarOutlined />,
    accent: "#22c55e",
    trend: { value: "+3%", isPositive: true },
  },
  {
    id: "requests",
    title: "Đăng ký học phần",
    value: "4 / 5",
    subtext: "1 môn chờ duyệt",
    icon: <TrophyOutlined />,
    accent: "#f97316",
    trend: { value: "-1", isPositive: false },
  },
  {
    id: "credentials",
    title: "Chứng chỉ",
    value: "6",
    subtext: "2 chứng chỉ mới tháng này",
    icon: <CheckCircleOutlined />,
    accent: "#14b8a6",
    trend: { value: "+2", isPositive: true },
  },
];

const performanceData = [
  { name: "Kỳ 1", credits: 15, gpa: 3.1 },
  { name: "Kỳ 2", credits: 18, gpa: 3.25 },
  { name: "Kỳ 3", credits: 18, gpa: 3.4 },
  { name: "Kỳ 4", credits: 20, gpa: 3.35 },
  { name: "Kỳ 5", credits: 19, gpa: 3.5 },
  { name: "Kỳ 6", credits: 21, gpa: 3.6 },
];

interface OverviewRecord {
  key: string;
  item: string;
  category: string;
  status: "onTrack" | "warning" | "pending";
  updated: string;
}

const overviewData: OverviewRecord[] = [
  {
    key: "1",
    item: "Đồ án SE302",
    category: "Lộ trình",
    status: "onTrack",
    updated: "Còn 2 tuần",
  },
  {
    key: "2",
    item: "Đăng ký môn AI301",
    category: "Đăng ký",
    status: "pending",
    updated: "Chờ duyệt",
  },
  {
    key: "3",
    item: "Điểm danh CS202",
    category: "Attendance",
    status: "warning",
    updated: "87% - cần chú ý",
  },
  {
    key: "4",
    item: "Yêu cầu chứng chỉ blockchain",
    category: "Chứng chỉ",
    status: "pending",
    updated: "Đang xử lý",
  },
  {
    key: "5",
    item: "Lịch thi tuần này",
    category: "Nhắc nhở",
    status: "onTrack",
    updated: "Thứ 5, 9:00",
  },
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

const Dashboard: React.FC = () => {
  const renderTrend = (trend?: StatCard["trend"]) => {
    if (!trend) return null;

    return (
      <div
        className={`trend-indicator ${trend.isPositive ? "positive" : "negative"}`}
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
          <Title level={3}>Tổng quan học tập</Title>
          <Text type="secondary">Cập nhật ngày 12/12/2025</Text>
        </div>
        <div className="header-meta">
          <Text strong>Học kỳ: Fall 2025</Text>
          <span className="dot" />
          <Text type="secondary">Mã sinh viên: SE170999</Text>
        </div>
      </div>

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
                <Text strong>Hiệu suất theo học kỳ</Text>
                <Text type="secondary" className="card-description">
                  Tổng tín chỉ tích lũy & GPA qua từng kỳ
                </Text>
              </div>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={performanceData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#a3a3a3" />
                  <YAxis yAxisId="left" stroke="#a3a3a3" />
                  <YAxis yAxisId="right" orientation="right" stroke="#a3a3a3" />
                  <RechartsTooltip />
                  <Bar
                    yAxisId="left"
                    dataKey="credits"
                    name="Tín chỉ"
                    fill="#1a94fc"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="gpa"
                    name="GPA"
                    fill="#52c41a"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card className="section-card" bordered={false}>
            <div className="card-title">
              <div>
                <Text strong>Dòng công việc nổi bật</Text>
                <Text type="secondary" className="card-description">
                  Theo dõi nhanh các nhiệm vụ học tập quan trọng
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
    </div>
  );
};

export default Dashboard;
