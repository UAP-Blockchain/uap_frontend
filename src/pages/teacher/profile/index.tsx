import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Card,
  Col,
  Descriptions,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
  message,
  Empty,
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
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await TeacherServices.getMyProfile();
        setProfile(data);
        if (data.classes && data.classes.length > 0) {
          setSelectedClassId(data.classes[0].classId);
        }
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

  const stats = useMemo(() => {
    if (!profile) {
      return [];
    }
    return [
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
  }, [profile]);

  const selectedClass = useMemo(() => {
    if (!profile || profile.classes.length === 0) return null;
    const found = profile.classes.find((cls) => cls.classId === selectedClassId);
    return found ?? profile.classes[0];
  }, [profile, selectedClassId]);

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

          <Card bordered={false} className="classes-card">
            <div className="classes-header">
              <h4>Danh sách lớp giảng dạy</h4>
              <Select
                className="class-selector"
                placeholder="Chọn lớp"
                size="large"
                popupMatchSelectWidth={false}
                value={selectedClassId ?? undefined}
                onChange={setSelectedClassId}
              >
                {profile.classes.map((cls) => (
                  <Select.Option key={cls.classId} value={cls.classId}>
                    <div className="class-option">
                      <span>{cls.classCode}</span>
                      <Tag color="blue">{cls.semesterName}</Tag>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </div>

            {profile.classes.length === 0 ? (
              <Empty description="Không có lớp nào" />
            ) : (
              selectedClass && (
                <div className="class-detail-card">
                  <div className="class-detail-header">
                    <div>
                      <Text strong className="class-code">
                        {selectedClass.classCode}
                      </Text>
                      <Tag color="blue">{selectedClass.semesterName}</Tag>
                      <div className="class-title">
                        {selectedClass.subjectName}
                      </div>
                    </div>
                  </div>
                  <div className="class-meta-grid">
                    <div>
                      <p>Tín chỉ</p>
                      <strong>{selectedClass.credits}</strong>
                    </div>
                    <div>
                      <p>Sĩ số</p>
                      <strong>{selectedClass.totalStudents}</strong>
                    </div>
                    <div>
                      <p>Tổng ca</p>
                      <strong>{selectedClass.totalSlots}</strong>
                    </div>
                  </div>
                </div>
              )
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TeacherProfile;
