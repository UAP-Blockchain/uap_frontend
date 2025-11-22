import React, { useEffect, useState } from "react";
import {
  Avatar,
  Card,
  Col,
  Descriptions,
  List,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
  message,
} from "antd";
import {
  BookOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import TeacherServices from "../../../services/teacher/api.service";
import type { TeacherProfileDto } from "../../../types/Teacher";
import "./Profile.scss";

const { Title, Text } = Typography;

const TeacherProfile: React.FC = () => {
  const [profile, setProfile] = useState<TeacherProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await TeacherServices.getMyProfile();
        setProfile(data);
      } catch (err) {
        const messageText =
          (
            err as {
              response?: { data?: { message?: string } };
              message?: string;
            }
          )?.response?.data?.message ||
          (err as { message?: string }).message ||
          "Không thể tải hồ sơ giảng viên";
        message.error(messageText);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="teacher-profile">
        <div className="profile-loading">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="teacher-profile">
        <Card>
          <Text>Không có dữ liệu hồ sơ giảng viên.</Text>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      title: "Tổng số lớp",
      value: profile.totalClasses,
      icon: <BookOutlined />,
    },
    {
      title: "Tổng sinh viên",
      value: profile.totalStudents,
      icon: <TeamOutlined />,
    },
    {
      title: "Chuyên môn chính",
      value: profile.specialization,
      icon: <UserOutlined />,
      isText: true,
    },
  ];

  return (
    <div className="teacher-profile">
      <div className="page-header">
        <div>
          <Text type="secondary" style={{ letterSpacing: 2 }}>
            TEACHER PROFILE
          </Text>
          <Title level={2} style={{ margin: "4px 0 0" }}>
            Hồ sơ giảng viên
          </Title>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card className="profile-overview-card" bordered={false}>
            <div className="profile-header">
              <Avatar
                size={96}
                icon={<UserOutlined />}
                src="/image/avatarTeacher.jpg"
                className="profile-avatar"
              />
              <Title level={3} className="profile-name">
                {profile.fullName}
              </Title>
              <Tag color={profile.isActive ? "green" : "red"}>
                {profile.isActive ? "Đang giảng dạy" : "Ngưng hoạt động"}
              </Tag>
              <Text type="secondary">{profile.teacherCode}</Text>
            </div>

            <Descriptions column={1} size="small" labelStyle={{ width: 140 }}>
              <Descriptions.Item label="Email">
                <Space>
                  <MailOutlined style={{ color: "#1a94fc" }} />
                  <Text copyable>{profile.email}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Điện thoại">
                <Space>
                  <PhoneOutlined style={{ color: "#13c2c2" }} />
                  <Text>{profile.phoneNumber}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Chuyên môn">
                <Tag color="blue">{profile.specialization}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày vào trường">
                {dayjs(profile.hireDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo tài khoản">
                {dayjs(profile.createdAt).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Row gutter={[16, 16]}>
            {stats.map((stat) => (
              <Col xs={24} md={8} key={stat.title}>
                <Card bordered={false} className="stat-card">
                  <Statistic
                    title={
                      <Space size={4} align="center">
                        {stat.icon}
                        <span>{stat.title}</span>
                      </Space>
                    }
                    value={stat.value}
                    valueStyle={
                      stat.isText
                        ? { fontSize: 16, color: "#1a94fc" }
                        : undefined
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>

          <Card
            title="Danh sách lớp giảng dạy"
            bordered={false}
            className="classes-card"
          >
            <List
              dataSource={profile.classes}
              locale={{ emptyText: "Không có lớp nào" }}
              renderItem={(cls) => (
                <List.Item className="class-item">
                  <List.Item.Meta
                    title={
                      <Space size={8}>
                        <Text strong>{cls.classCode}</Text>
                        <Tag color="blue">{cls.semesterName}</Tag>
                      </Space>
                    }
                    description={
                      <div className="class-info">
                        <Text strong>{cls.subjectName}</Text>
                        <div className="class-meta">
                          <span>Tín chỉ: {cls.credits}</span>
                          <span>Sĩ số: {cls.totalStudents}</span>
                          <span>Tổng ca: {cls.totalSlots}</span>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TeacherProfile;
