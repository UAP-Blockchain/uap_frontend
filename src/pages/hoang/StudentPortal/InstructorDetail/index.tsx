import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  Descriptions,
  Button,
  Space,
  Typography,
  Avatar,
  Row,
  Col,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  MailOutlined,
  BookOutlined,
  TrophyOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import "./InstructorDetail.scss";

const { Title, Text } = Typography;

interface InstructorDetailData {
  code: string;
  login: string;
  fullName: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  image?: string;
  bio?: string;
  courses?: string[];
  experience?: string;
}

const InstructorDetail: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Mock instructor data
  const getInstructorData = (
    instructorCode: string
  ): InstructorDetailData | null => {
    const mockData: Record<string, InstructorDetailData> = {
      DuyNK32: {
        code: "DuyNK32",
        login: "duynk32",
        fullName: "Dr. Nguyễn Khánh Duy",
        email: "DuyNK33@fe.edu.vn",
        phone: "+84 123 456 789",
        department: "Political Education Department",
        position: "Senior Lecturer",
        image: "", // Empty like in the original image
        bio: "Dr. Duy has over 15 years of experience in political education and Ho Chi Minh ideology research.",
        courses: [
          "HCM202 - Ho Chi Minh Ideology",
          "MLN131 - Marxist-Leninist Philosophy",
        ],
        experience: "15 years",
      },
      TranTB: {
        code: "TranTB",
        login: "trantb",
        fullName: "Prof. Trần Thị Bình",
        email: "TranTB@fe.edu.vn",
        phone: "+84 987 654 321",
        department: "Philosophy Department",
        position: "Professor",
        image: "",
        bio: "Prof. Tran specializes in Marxist-Leninist philosophy with focus on dialectical materialism.",
        courses: [
          "MLN131 - Marxist-Leninist Philosophy",
          "PHI101 - Introduction to Philosophy",
        ],
        experience: "20 years",
      },
      LeVC: {
        code: "LeVC",
        login: "levc",
        fullName: "Mr. Lê Văn Cường",
        email: "LeVC@fe.edu.vn",
        phone: "+84 456 789 123",
        department: "Software Engineering Department",
        position: "Project Supervisor",
        image: "",
        bio: "Mr. Le is an experienced software engineer and project manager with industry background.",
        courses: [
          "SEP490 - Capstone Project",
          "SWP391 - Software Development Project",
        ],
        experience: "12 years",
      },
    };

    return mockData[instructorCode] || null;
  };

  const instructorData = getInstructorData(code || "");
  const fromActivity = location.state?.fromActivity || false;

  if (!instructorData) {
    return (
      <div className="instructor-detail">
        <Card>
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <Title level={3}>Instructor Not Found</Title>
            <Text type="secondary">
              The requested instructor could not be found.
            </Text>
            <br />
            <Button
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              style={{ marginTop: 16 }}
            >
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleBackClick = () => {
    if (fromActivity) {
      navigate(-1); // Go back to activity detail
    } else {
      navigate("/student-portal/timetable");
    }
  };

  const handleCourseAttendance = () => {
    navigate("/student-portal/attendance-report");
  };

  const handleGrades = () => {
    navigate("/student-portal/grade-report");
  };

  return (
    <div className="instructor-detail">
      {/* Header */}
      <div className="detail-header">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBackClick}
          style={{ marginBottom: 16 }}
        >
          {fromActivity ? "Back to Activity" : "Back to Timetable"}
        </Button>

        <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
          User Detail
        </Title>
      </div>

      <Row gutter={[24, 24]}>
        {/* Main Information */}
        <Col xs={24} lg={16}>
          <Card className="main-info-card">
            <div className="instructor-header">
              <Space size="large" align="start">
                <div className="instructor-avatar">
                  <Avatar
                    size={120}
                    icon={<UserOutlined />}
                    src={instructorData.image || undefined}
                    style={{
                      background: instructorData.image ? "none" : "#f0f0f0",
                      border: "2px solid #d9d9d9",
                    }}
                  />
                </div>
                <div className="instructor-info">
                  <Title level={3} style={{ margin: "0 0 8px 0" }}>
                    {instructorData.fullName}
                  </Title>
                  <Text
                    type="secondary"
                    style={{ display: "block", marginBottom: 8 }}
                  >
                    {instructorData.position} • {instructorData.department}
                  </Text>
                  <Space>
                    <Button
                      type="link"
                      style={{ padding: 0, color: "#1890ff" }}
                      onClick={handleCourseAttendance}
                    >
                      Course attendance
                    </Button>
                    <Text>|</Text>
                    <Button
                      type="link"
                      style={{ padding: 0, color: "#1890ff" }}
                      onClick={handleGrades}
                    >
                      Grade
                    </Button>
                  </Space>
                </div>
              </Space>
            </div>

            <Divider />

            <Descriptions column={2} bordered>
              <Descriptions.Item label="Login">
                <Text strong>{instructorData.login}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Instructor Code">
                <Text strong>{instructorData.code}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Full Name" span={2}>
                <Text strong>{instructorData.fullName}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Email" span={2}>
                <Space>
                  <MailOutlined />
                  <Text copyable>{instructorData.email}</Text>
                </Space>
              </Descriptions.Item>

              {instructorData.phone && (
                <Descriptions.Item label="Phone">
                  <Space>
                    <PhoneOutlined />
                    <Text>{instructorData.phone}</Text>
                  </Space>
                </Descriptions.Item>
              )}

              <Descriptions.Item label="Experience">
                <Space>
                  <TrophyOutlined />
                  <Text>{instructorData.experience}</Text>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Department" span={2}>
                <Space>
                  <EnvironmentOutlined />
                  <Text>{instructorData.department}</Text>
                </Space>
              </Descriptions.Item>

              {instructorData.bio && (
                <Descriptions.Item label="Biography" span={2}>
                  <Text>{instructorData.bio}</Text>
                </Descriptions.Item>
              )}
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
                  icon={<MailOutlined />}
                  block
                  onClick={() => window.open(`mailto:${instructorData.email}`)}
                >
                  Send Email
                </Button>
                <Button
                  icon={<BookOutlined />}
                  block
                  onClick={handleCourseAttendance}
                >
                  View Course Attendance
                </Button>
                <Button icon={<TrophyOutlined />} block onClick={handleGrades}>
                  View Grades
                </Button>
              </Space>
            </Card>

            {/* Teaching Courses */}
            {instructorData.courses && (
              <Card title="📚 Teaching Courses" className="sidebar-card">
                <Space direction="vertical" style={{ width: "100%" }}>
                  {instructorData.courses.map((course, index) => (
                    <div key={index} className="course-item">
                      <Space>
                        <BookOutlined style={{ color: "#1890ff" }} />
                        <Text>{course}</Text>
                      </Space>
                    </div>
                  ))}
                </Space>
              </Card>
            )}

            {/* Contact Information */}
            <Card title="📞 Contact Information" className="sidebar-card">
              <Space direction="vertical" style={{ width: "100%" }}>
                <div className="contact-item">
                  <Text strong>Email:</Text>
                  <br />
                  <Text copyable>{instructorData.email}</Text>
                </div>
                {instructorData.phone && (
                  <>
                    <Divider style={{ margin: "12px 0" }} />
                    <div className="contact-item">
                      <Text strong>Phone:</Text>
                      <br />
                      <Text>{instructorData.phone}</Text>
                    </div>
                  </>
                )}
                <Divider style={{ margin: "12px 0" }} />
                <div className="contact-item">
                  <Text strong>Department:</Text>
                  <br />
                  <Text>{instructorData.department}</Text>
                </div>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default InstructorDetail;
