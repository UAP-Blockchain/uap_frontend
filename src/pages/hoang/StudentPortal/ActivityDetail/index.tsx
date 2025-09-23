import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  Descriptions,
  Button,
  Space,
  Typography,
  Tag,
  Row,
  Col,
  Avatar,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  BookOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  LinkOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "./ActivityDetail.scss";

const { Title, Text } = Typography;

interface ActivityDetailData {
  id: string;
  date: string;
  slot: number;
  slotTime: string;
  studentGroup: string;
  instructor: {
    code: string;
    name: string;
    email: string;
    meetUrl: string;
  };
  course: {
    code: string;
    name: string;
  };
  sessionNumber: number;
  sessionType: string;
  sessionDescription: string;
  campus: string;
  programme: string;
  attendance: "attended" | "absent" | "not_yet";
  recordTime: string;
  room: string;
  building: string;
}

const ActivityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Mock activity data
  const getActivityData = (activityId: string): ActivityDetailData | null => {
    const mockData: Record<string, ActivityDetailData> = {
      hcm202_tue_slot2: {
        id: "hcm202_tue_slot2",
        date: "2025-09-23",
        slot: 2,
        slotTime: "09:30 - 11:20",
        studentGroup: "Half1_GD1705",
        instructor: {
          code: "DuyNK32",
          name: "Dr. Nguyen Van Duy",
          email: "DuyNK33@fe.edu.vn",
          meetUrl: "https://meet.google.com/abc-defg-hij",
        },
        course: {
          code: "HCM202",
          name: "Ho Chi Minh Ideology",
        },
        sessionNumber: 5,
        sessionType: "Theory",
        sessionDescription:
          "Ho Chi Minh's thoughts on national independence and socialism",
        campus: "FPT University Ho Chi Minh",
        programme: "Software Engineering",
        attendance: "not_yet",
        recordTime: "2025-07-25T11:21:00",
        room: "NVH 409",
        building: "NVH",
      },
      mln131_tue_slot3: {
        id: "mln131_tue_slot3",
        date: "2025-09-23",
        slot: 3,
        slotTime: "12:30 - 14:20",
        studentGroup: "Half2_GD1705",
        instructor: {
          code: "TranTB",
          name: "Prof. Tran Thi Binh",
          email: "TranTB@fe.edu.vn",
          meetUrl: "https://meet.google.com/xyz-uvwx-123",
        },
        course: {
          code: "MLN131",
          name: "Marxist-Leninist Philosophy",
        },
        sessionNumber: 8,
        sessionType: "Practical",
        sessionDescription:
          "Dialectical materialism and historical materialism",
        campus: "FPT University Ho Chi Minh",
        programme: "Software Engineering",
        attendance: "attended",
        recordTime: "2025-07-25T14:35:00",
        room: "NVH 502",
        building: "NVH",
      },
      sep490_sat_slot3: {
        id: "sep490_sat_slot3",
        date: "2025-09-27",
        slot: 3,
        slotTime: "12:30 - 14:20",
        studentGroup: "Team_Alpha",
        instructor: {
          code: "LeVC",
          name: "Mr. Le Van Cuong",
          email: "LeVC@fe.edu.vn",
          meetUrl: "https://meet.google.com/sep-490-alpha",
        },
        course: {
          code: "SEP490",
          name: "Capstone Project",
        },
        sessionNumber: 12,
        sessionType: "Project Review",
        sessionDescription: "Final project presentation and evaluation",
        campus: "FPT University Ho Chi Minh",
        programme: "Software Engineering",
        attendance: "not_yet",
        recordTime: "2025-07-25T16:45:00",
        room: "P.136",
        building: "Alpha",
      },
    };

    return mockData[activityId] || null;
  };

  const activityData = getActivityData(id || "");

  if (!activityData) {
    return (
      <div className="activity-detail">
        <Card>
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <Title level={3}>Activity Not Found</Title>
            <Text type="secondary">
              The requested activity could not be found.
            </Text>
            <br />
            <Button
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/student-portal/timetable")}
              style={{ marginTop: 16 }}
            >
              Back to Timetable
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const getAttendanceTag = (attendance: string) => {
    switch (attendance) {
      case "attended":
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Attended
          </Tag>
        );
      case "absent":
        return (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            Absent
          </Tag>
        );
      case "not_yet":
        return (
          <Tag color="warning" icon={<ExclamationCircleOutlined />}>
            Not Yet
          </Tag>
        );
      default:
        return <Tag color="default">Unknown</Tag>;
    }
  };

  const handleInstructorClick = () => {
    navigate(`/student-portal/instructor/${activityData.instructor.code}`, {
      state: { instructorData: activityData.instructor, fromActivity: true },
    });
  };

  const handleStudentGroupClick = () => {
    navigate(`/student-portal/class-list/${activityData.course.code}`, {
      state: {
        courseData: activityData.course,
        studentGroup: activityData.studentGroup,
        fromActivity: true,
      },
    });
  };

  const handleMeetURL = () => {
    window.open(activityData.instructor.meetUrl, "_blank");
  };

  return (
    <div className="activity-detail">
      {/* Header */}
      <div className="detail-header">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/student-portal/timetable")}
          style={{ marginBottom: 16 }}
        >
          Back to Timetable
        </Button>

        <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
          Activity Detail
        </Title>
      </div>

      <Row gutter={[24, 24]}>
        {/* Main Information */}
        <Col xs={24} lg={16}>
          <Card className="main-info-card">
            <Descriptions title="Class Information" column={2} bordered>
              <Descriptions.Item label="Date" span={2}>
                <Space>
                  <CalendarOutlined />
                  <Text strong>
                    {dayjs(activityData.date).format("dddd DD/MM/YYYY")}
                  </Text>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Slot">
                <Space>
                  <ClockCircleOutlined />
                  <Text>{activityData.slot}</Text>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Time">
                <Text strong>{activityData.slotTime}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Student Group">
                <Button
                  type="link"
                  style={{ padding: 0, color: "#1890ff" }}
                  onClick={handleStudentGroupClick}
                >
                  {activityData.studentGroup}
                </Button>
              </Descriptions.Item>

              <Descriptions.Item label="Instructor">
                <Space>
                  <Button
                    type="link"
                    style={{ padding: 0, color: "#1890ff" }}
                    onClick={handleInstructorClick}
                  >
                    {activityData.instructor.code} -{" "}
                    {activityData.instructor.name}
                  </Button>
                  <Button
                    size="small"
                    style={{
                      background: "#ffa940",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                    }}
                    onClick={handleMeetURL}
                  >
                    MeetURL
                  </Button>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Course" span={2}>
                <Space>
                  <BookOutlined />
                  <Text strong>
                    {activityData.course.name} ({activityData.course.code})
                  </Text>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Course Session Number">
                <Tag color="blue">{activityData.sessionNumber}</Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Course Session Type">
                <Tag color="green">{activityData.sessionType}</Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Course Session Description" span={2}>
                <Text italic>{activityData.sessionDescription}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Campus/Programme">
                <Space direction="vertical" size="small">
                  <Text>{activityData.campus}</Text>
                  <Text type="secondary">{activityData.programme}</Text>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Location">
                <Space>
                  <EnvironmentOutlined />
                  <Text>
                    {activityData.room} - {activityData.building} Building
                  </Text>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Attendance">
                {getAttendanceTag(activityData.attendance)}
              </Descriptions.Item>

              <Descriptions.Item label="Record Time">
                <Text>
                  {dayjs(activityData.recordTime).format("DD/MM/YYYY HH:mm:ss")}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            {/* Quick Actions */}
            <Card title="⚡ Quick Actions" className="sidebar-card">
              <Space direction="vertical" style={{ width: "100%" }}>
                <Button
                  type="primary"
                  icon={<LinkOutlined />}
                  block
                  onClick={handleMeetURL}
                >
                  Join Online Meeting
                </Button>
                <Button
                  icon={<UserOutlined />}
                  block
                  onClick={handleInstructorClick}
                >
                  View Instructor Profile
                </Button>
                <Button
                  icon={<TeamOutlined />}
                  block
                  onClick={handleStudentGroupClick}
                >
                  View Student List
                </Button>
                <Button
                  icon={<BookOutlined />}
                  block
                  onClick={() => navigate("/student-portal/attendance-report")}
                >
                  View Attendance Report
                </Button>
                <Button
                  icon={<BarChartOutlined />}
                  block
                  onClick={() => navigate("/student-portal/grade-report")}
                >
                  View Grade Report
                </Button>
              </Space>
            </Card>

            {/* Course Summary */}
            <Card title="📚 Course Summary" className="sidebar-card">
              <Space direction="vertical" style={{ width: "100%" }}>
                <div className="summary-item">
                  <Text strong>Course:</Text>
                  <br />
                  <Text>{activityData.course.code}</Text>
                </div>
                <Divider style={{ margin: "12px 0" }} />
                <div className="summary-item">
                  <Text strong>Session:</Text>
                  <br />
                  <Text>{activityData.sessionNumber} / 15</Text>
                </div>
                <Divider style={{ margin: "12px 0" }} />
                <div className="summary-item">
                  <Text strong>Type:</Text>
                  <br />
                  <Text>{activityData.sessionType}</Text>
                </div>
                <Divider style={{ margin: "12px 0" }} />
                <div className="summary-item">
                  <Text strong>Group:</Text>
                  <br />
                  <Text>{activityData.studentGroup}</Text>
                </div>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default ActivityDetail;
