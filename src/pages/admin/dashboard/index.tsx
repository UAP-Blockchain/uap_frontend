import React from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Badge,
  Avatar,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import "./index.scss";

const Dashboard: React.FC = () => {
  // Mock data for statistics
  const stats = {
    totalStudents: 1247,
    totalTeachers: 89,
    totalClasses: 156,
    activeCredentials: 892,
    studentsGrowth: 12.5,
    teachersGrowth: 3.2,
    classesGrowth: 8.7,
    credentialsGrowth: 15.3,
  };

  // Mock data for recent activities
  const recentActivities = [
    {
      key: "1",
      action: "Cấp chứng chỉ",
      student: "Nguyễn Phi Hùng",
      time: "2 giờ trước",
      status: "success",
    },
    {
      key: "2",
      action: "Cập nhật điểm",
      student: "Nguyễn Trung Nam",
      time: "3 giờ trước",
      status: "success",
    },
    {
      key: "3",
      action: "Thêm lớp học",
      student: "Blockchain Development",
      time: "5 giờ trước",
      status: "success",
    },
    {
      key: "4",
      action: "Đăng ký sinh viên",
      student: "Huỳnh Gia Bảo",
      time: "1 ngày trước",
      status: "processing",
    },
  ];

  // Mock data for top performing classes
  const topClasses = [
    {
      key: "1",
      className: "Blockchain Development",
      students: 45,
      completion: 87,
      teacher: "Nguyễn Ngọc Lâm",
    },
    {
      key: "2",
      className: "Smart Contract Programming",
      students: 38,
      completion: 92,
      teacher: "Trần Văn An",
    },
    {
      key: "3",
      className: "Cryptocurrency Economics",
      students: 52,
      completion: 78,
      teacher: "Lê Thị Bình",
    },
    {
      key: "4",
      className: "Distributed Systems",
      students: 41,
      completion: 85,
      teacher: "Phạm Minh Đức",
    },
  ];

  const activityColumns = [
    {
      title: "Hoạt động",
      dataIndex: "action",
      key: "action",
      render: (text: string) => (
        <div className="activity-action">
          <ClockCircleOutlined className="activity-icon" />
          {text}
        </div>
      ),
    },
    {
      title: "Đối tượng",
      dataIndex: "student",
      key: "student",
      render: (text: string) => (
        <div className="activity-student">
          <Avatar size="small" icon={<UserOutlined />} />
          <span className="student-name">{text}</span>
        </div>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Badge
          status={status === "success" ? "success" : "processing"}
          text={status === "success" ? "Hoàn thành" : "Đang xử lý"}
        />
      ),
    },
  ];

  const classColumns = [
    {
      title: "Lớp học",
      dataIndex: "className",
      key: "className",
      render: (text: string) => (
        <div className="class-name">
          <BookOutlined className="class-icon" />
          {text}
        </div>
      ),
    },
    {
      title: "Sinh viên",
      dataIndex: "students",
      key: "students",
    },
    {
      title: "Tỷ lệ hoàn thành",
      dataIndex: "completion",
      key: "completion",
      render: (completion: number) => (
        <Progress
          percent={completion}
          size="small"
          strokeColor={
            completion >= 90
              ? "#52c41a"
              : completion >= 80
              ? "#faad14"
              : "#ff6b35"
          }
        />
      ),
    },
    {
      title: "Giảng viên",
      dataIndex: "teacher",
      key: "teacher",
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard - Hệ thống Quản lý Học tập Blockchain</h1>
        <p>Tổng quan về hoạt động của hệ thống</p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card students-card">
            <Statistic
              title="Tổng sinh viên"
              value={stats.totalStudents}
              prefix={<UserOutlined />}
              suffix={
                <div className="growth-indicator">
                  <RiseOutlined style={{ color: "#52c41a" }} />
                  <span className="growth-text">+{stats.studentsGrowth}%</span>
                </div>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card teachers-card">
            <Statistic
              title="Tổng giảng viên"
              value={stats.totalTeachers}
              prefix={<TeamOutlined />}
              suffix={
                <div className="growth-indicator">
                  <RiseOutlined style={{ color: "#52c41a" }} />
                  <span className="growth-text">+{stats.teachersGrowth}%</span>
                </div>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card classes-card">
            <Statistic
              title="Lớp học đang hoạt động"
              value={stats.totalClasses}
              prefix={<BookOutlined />}
              suffix={
                <div className="growth-indicator">
                  <RiseOutlined style={{ color: "#52c41a" }} />
                  <span className="growth-text">+{stats.classesGrowth}%</span>
                </div>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card credentials-card">
            <Statistic
              title="Chứng chỉ đã cấp"
              value={stats.activeCredentials}
              prefix={<TrophyOutlined />}
              suffix={
                <div className="growth-indicator">
                  <RiseOutlined style={{ color: "#52c41a" }} />
                  <span className="growth-text">
                    +{stats.credentialsGrowth}%
                  </span>
                </div>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Charts and Tables */}
      <Row gutter={[24, 24]} className="content-row">
        <Col xs={24} lg={14}>
          <Card title="Hoạt động gần đây" className="activity-card">
            <Table
              dataSource={recentActivities}
              columns={activityColumns}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Lớp học hàng đầu" className="top-classes-card">
            <Table
              dataSource={topClasses}
              columns={classColumns}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Additional Statistics */}
      <Row gutter={[24, 24]} className="additional-stats">
        <Col xs={24} md={8}>
          <Card className="completion-card">
            <div className="completion-header">
              <h3>Tỷ lệ hoàn thành khóa học</h3>
              <CheckCircleOutlined className="completion-icon" />
            </div>
            <Progress
              type="circle"
              percent={87}
              strokeColor="#ff6b35"
              size={120}
              format={(percent) => `${percent}%`}
            />
            <p className="completion-text">Trung bình tất cả khóa học</p>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="attendance-card">
            <div className="attendance-header">
              <h3>Tỷ lệ điểm danh</h3>
              <ClockCircleOutlined className="attendance-icon" />
            </div>
            <Progress
              type="circle"
              percent={92}
              strokeColor="#52c41a"
              size={120}
              format={(percent) => `${percent}%`}
            />
            <p className="attendance-text">Tháng này</p>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="blockchain-card">
            <div className="blockchain-header">
              <h3>Giao dịch Blockchain</h3>
              <TrophyOutlined className="blockchain-icon" />
            </div>
            <div className="blockchain-stats">
              <div className="blockchain-stat">
                <span className="stat-number">1,247</span>
                <span className="stat-label">Tổng giao dịch</span>
              </div>
              <div className="blockchain-stat">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Độ tin cậy</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
