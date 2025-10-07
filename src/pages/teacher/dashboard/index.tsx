import React from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  List,
  Avatar,
  Tag,
  Calendar,
  Badge,
  Button,
  Timeline,
  Alert,
} from "antd";
import {
  BookOutlined,
  UserOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  EditOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import "./index.scss";

const TeacherDashboard: React.FC = () => {
  // Mock data for teacher dashboard
  const teacherStats = {
    totalClasses: 5,
    totalStudents: 142,
    todayClasses: 3,
    completedLessons: 28,
    pendingGrades: 15,
    attendanceRate: 85.6,
  };

  const todaySchedule = [
    {
      id: 1,
      time: "08:00 - 09:30",
      subject: "Toán cao cấp A1",
      class: "CNTT2023A",
      room: "A101",
      students: 35,
      status: "completed",
    },
    {
      id: 2,
      time: "10:00 - 11:30",
      subject: "Cấu trúc dữ liệu",
      class: "CNTT2023B",
      room: "B205",
      students: 32,
      status: "in-progress",
    },
    {
      id: 3,
      time: "14:00 - 15:30",
      subject: "Lập trình Java",
      class: "CNTT2022A",
      room: "C301",
      students: 28,
      status: "upcoming",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "grading",
      title: "Chấm điểm bài kiểm tra Toán cao cấp",
      class: "CNTT2023A",
      time: "2 giờ trước",
      icon: <EditOutlined />,
      color: "blue",
    },
    {
      id: 2,
      type: "attendance",
      title: "Điểm danh lớp Cấu trúc dữ liệu",
      class: "CNTT2023B",
      time: "4 giờ trước",
      icon: <UserOutlined />,
      color: "green",
    },
    {
      id: 3,
      type: "result",
      title: "Cập nhật kết quả học kỳ",
      class: "CNTT2022A",
      time: "1 ngày trước",
      icon: <TrophyOutlined />,
      color: "orange",
    },
  ];

  const pendingTasks = [
    {
      id: 1,
      title: "Chấm điểm bài tập lớn Java",
      class: "CNTT2022A",
      deadline: "Hôm nay",
      priority: "high",
    },
    {
      id: 2,
      title: "Cập nhật điểm danh tuần này",
      class: "CNTT2023B",
      deadline: "2 ngày nữa",
      priority: "medium",
    },
    {
      id: 3,
      title: "Soạn đề kiểm tra giữa kỳ",
      class: "CNTT2023A",
      deadline: "1 tuần nữa",
      priority: "low",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "in-progress":
        return "processing";
      case "upcoming":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Đã hoàn thành";
      case "in-progress":
        return "Đang diễn ra";
      case "upcoming":
        return "Sắp tới";
      default:
        return "";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "red";
      case "medium":
        return "orange";
      case "low":
        return "blue";
      default:
        return "default";
    }
  };

  const onPanelChange = (value: Dayjs, mode: any) => {
    console.log(value.format("YYYY-MM-DD"), mode);
  };

  const dateCellRender = (value: Dayjs) => {
    // Mock data for calendar events
    const events = [
      {
        date: dayjs().format("YYYY-MM-DD"),
        type: "success",
        content: "3 lớp học",
      },
      {
        date: dayjs().add(1, "day").format("YYYY-MM-DD"),
        type: "warning",
        content: "2 lớp học",
      },
      {
        date: dayjs().add(2, "day").format("YYYY-MM-DD"),
        type: "error",
        content: "Kiểm tra",
      },
    ];

    const dayEvents = events.filter(
      (event) => event.date === value.format("YYYY-MM-DD")
    );

    return (
      <div className="calendar-events">
        {dayEvents.map((event, index) => (
          <Badge
            key={index}
            status={event.type as any}
            text={event.content}
            style={{ fontSize: "10px", display: "block" }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <h1>Chào mừng trở lại, GV. Nguyễn Văn A!</h1>
        <p>Hôm nay là {dayjs().format("dddd, DD/MM/YYYY")}</p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} className="stats-row">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số lớp"
              value={teacherStats.totalClasses}
              prefix={<BookOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số học sinh"
              value={teacherStats.totalStudents}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Lớp hôm nay"
              value={teacherStats.todayClasses}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Điểm chưa chấm"
              value={teacherStats.pendingGrades}
              prefix={<EditOutlined />}
              valueStyle={{ color: "#f5222d" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Today's Schedule */}
        <Col xs={24} lg={12}>
          <Card
            title="Lịch dạy hôm nay"
            extra={
              <Button type="link" icon={<CalendarOutlined />}>
                Xem tất cả
              </Button>
            }
          >
            <List
              dataSource={todaySchedule}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{
                          backgroundColor:
                            item.status === "completed"
                              ? "#52c41a"
                              : item.status === "in-progress"
                              ? "#1890ff"
                              : "#d9d9d9",
                        }}
                        icon={<BookOutlined />}
                      />
                    }
                    title={
                      <div>
                        <span>{item.subject}</span>
                        <Tag
                          color={getStatusColor(item.status)}
                          style={{ marginLeft: 8 }}
                        >
                          {getStatusText(item.status)}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <div>
                          {item.time} - Phòng {item.room}
                        </div>
                        <div>
                          Lớp: {item.class} - {item.students} sinh viên
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Quick Actions & Attendance Rate */}
        <Col xs={24} lg={12}>
          <Row gutter={[0, 24]}>
            <Col span={24}>
              <Card title="Tỷ lệ tham gia lớp học">
                <Progress
                  type="circle"
                  percent={teacherStats.attendanceRate}
                  format={(percent) => `${percent}%`}
                  strokeColor={{
                    "0%": "#108ee9",
                    "100%": "#87d068",
                  }}
                />
                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <p>Tỷ lệ sinh viên tham gia lớp học trung bình</p>
                </div>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Recent Activities */}
        <Col xs={24} lg={12}>
          <Card
            title="Hoạt động gần đây"
            extra={
              <Button type="link" icon={<BarChartOutlined />}>
                Xem chi tiết
              </Button>
            }
          >
            <Timeline>
              {recentActivities.map((activity) => (
                <Timeline.Item
                  key={activity.id}
                  dot={activity.icon}
                  color={activity.color}
                >
                  <div>
                    <h4>{activity.title}</h4>
                    <p>Lớp: {activity.class}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>

        {/* Pending Tasks */}
        <Col xs={24} lg={12}>
          <Card title="Công việc cần hoàn thành">
            <List
              dataSource={pendingTasks}
              renderItem={(task) => (
                <List.Item
                  actions={[
                    <Button type="link" size="small">
                      Xem
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{
                          backgroundColor: getPriorityColor(task.priority),
                        }}
                        icon={<ExclamationCircleOutlined />}
                      />
                    }
                    title={task.title}
                    description={
                      <div>
                        <div>Lớp: {task.class}</div>
                        <div>Hạn: {task.deadline}</div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Calendar Overview */}
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title="Lịch giảng dạy tháng này">
            <Calendar
              onPanelChange={onPanelChange}
              dateCellRender={dateCellRender}
              mode="month"
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Alerts */}
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Alert
            message="Thông báo quan trọng"
            description="Bạn có 3 bài kiểm tra cần chấm điểm và 2 lớp học cần cập nhật điểm danh trong tuần này."
            type="info"
            showIcon
            action={
              <Button size="small" type="primary">
                Xem chi tiết
              </Button>
            }
            closable
          />
        </Col>
      </Row>
    </div>
  );
};

export default TeacherDashboard;
