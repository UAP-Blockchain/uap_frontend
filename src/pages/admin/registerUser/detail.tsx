import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  MailOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { UploadRequestOption } from "rc-upload/lib/interface";
import { useNavigate, useParams } from "react-router-dom";
import {
  getUserByIdApi,
  uploadUserProfilePictureApi,
} from "../../../services/admin/users/api";
import StudentServices from "../../../services/student/api.service";
import type {
  ClassInfo,
  EnrollmentInfo,
  StudentDetailDto,
} from "../../../types/Student";
import type { UserDto } from "../../../services/admin/users/api";
import dayjs from "dayjs";
import "./detail.scss";

const { Title, Text } = Typography;

type UploadApiResponse = {
  imageUrl?: string;
  data?: {
    imageUrl?: string;
    data?: {
      imageUrl?: string;
    };
  };
};

const StudentDetailPage: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDto | null>(null);
  const [student, setStudent] = useState<StudentDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const userDetail = await getUserByIdApi(userId);
      setUser(userDetail);

      if (userDetail.roleName === "Student") {
        const resolvedStudentId =
          userDetail.studentId || userDetail.student?.id;

        if (resolvedStudentId) {
          try {
            const studentDetail = await StudentServices.getStudentById(
              resolvedStudentId
            );
            setStudent(studentDetail);
          } catch (error) {
            console.error(error);
            message.error("Không thể tải chi tiết sinh viên");
            setStudent(null);
          }
        } else {
          message.warning("Không tìm thấy mã sinh viên tương ứng");
          setStudent(null);
        }
      } else {
        setStudent(null);
      }
    } catch (error) {
      console.error(error);
      message.error("Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  const handleUpload = async (options: UploadRequestOption) => {
    if (!userId) return;
    const { file, onError, onSuccess } = options;

    try {
      setUploading(true);
      const res = (await uploadUserProfilePictureApi(
        userId,
        file as File
      )) as UploadApiResponse;

      const imageUrl =
        res.data?.imageUrl ?? res.data?.data?.imageUrl ?? res.imageUrl;

      if (!imageUrl) {
        throw new Error("Không tìm thấy imageUrl trong response");
      }

      message.success("Cập nhật ảnh đại diện thành công");
      setUser((prev) =>
        prev ? { ...prev, profilePictureUrl: imageUrl } : prev
      );
      onSuccess?.(res, new XMLHttpRequest());
    } catch (error) {
      console.error(error);
      message.error("Không thể cập nhật ảnh đại diện");
      onError?.(error as Error);
    } finally {
      setUploading(false);
    }
  };

  const statistics = useMemo(() => {
    if (!student) {
      return [];
    }
    return [
      { label: "Tổng đăng ký", value: student.totalEnrollments },
      { label: "Đã duyệt", value: student.approvedEnrollments },
      { label: "Đang chờ", value: student.pendingEnrollments },
      { label: "Lớp hiện tại", value: student.totalClasses },
      { label: "Điểm đã nhập", value: student.totalGrades },
      { label: "Điểm danh", value: student.totalAttendances },
    ];
  }, [student]);

  if (!userId) {
    return (
      <div className="user-detail-page">
        <Empty description="Thiếu mã người dùng" />
      </div>
    );
  }

  const avatarSrc = user?.profileImageUrl || student?.profileImageUrl;
  const highlightedClasses: ClassInfo[] =
    student?.currentClasses?.slice(0, 2) ?? [];
  const highlightedEnrollments: EnrollmentInfo[] =
    student?.enrollments?.slice(0, 3) ?? [];

  return (
    <div className="user-detail-page">
      <div className="user-detail-header">
        <div className="header-left">
          <Button
            className="back-button"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>
          <div>
            <Title level={3} className="page-title">
              Hồ sơ người dùng
            </Title>
          </div>
        </div>
      </div>

      <Spin spinning={loading}>
        {user ? (
          <div className="page-body">
            <Card className="profile-hero">
              <div className="hero-content">
                <div className="hero-avatar">
                  <Avatar size={120} src={avatarSrc}>
                    {user.fullName?.charAt(0)}
                  </Avatar>
                  <Upload
                    showUploadList={false}
                    customRequest={handleUpload}
                    accept="image/*"
                  >
                    <Button
                      icon={<UploadOutlined />}
                      loading={uploading}
                      size="small"
                    >
                      Đổi ảnh
                    </Button>
                  </Upload>
                </div>

                <div className="hero-info">
                  <p className="eyebrow">Sinh viên</p>
                  <Title level={4}>{user.fullName}</Title>
                  <Space size="small" wrap>
                    <Tag color={user.isActive ? "success" : "default"}>
                      {user.isActive ? "Đang hoạt động" : "Vô hiệu hóa"}
                    </Tag>
                    <Tag color="processing">
                      {user.roleName === "Student" ? "Sinh viên" : "Giảng viên"}
                    </Tag>
                    {student?.studentCode && (
                      <Tag color="blue">Mã SV: {student.studentCode}</Tag>
                    )}
                  </Space>
                  <div className="email-chip">
                    <MailOutlined />
                    <span>{user.email}</span>
                  </div>
                </div>

                <div className="hero-meta">
                  <div className="meta-item">
                    <span>Ngày tạo</span>
                    <strong>
                      {user.createdAt
                        ? dayjs(user.createdAt).format("DD/MM/YYYY HH:mm")
                        : "—"}
                    </strong>
                  </div>
               
                </div>
              </div>

              {student && statistics.length > 0 && (
                <div className="stats-row">
                  {statistics.slice(0, 4).map((item) => (
                    <div key={item.label} className="stat-chip">
                      <div className="value">{item.value}</div>
                      <div className="label">{item.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <div className="panels-row">
              <Card className="info-card">
                <h4>Thông tin liên hệ</h4>
                <Descriptions
                  bordered
                  column={1}
                  size="small"
                  className="contact-descriptions"
                >
                  <Descriptions.Item label="Họ tên">
                    {user.fullName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {user.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="Vai trò">
                    {user.roleName === "Student" ? "Sinh viên" : "Giảng viên"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag color={user.isActive ? "success" : "default"}>
                      {user.isActive ? "Đang hoạt động" : "Vô hiệu hóa"}
                    </Tag>
                  </Descriptions.Item>
                  {user.roleName === "Teacher" && (
                    <Descriptions.Item label="Chuyên ngành">
                      {user.specializations && user.specializations.length > 0 ? (
                        <Space wrap>
                          {user.specializations.map((spec) => (
                            <Tag key={spec.id} color="blue">
                              {spec.code} - {spec.name}
                      </Tag>
                          ))}
                        </Space>
                      ) : (
                        <span style={{ color: "#999" }}>Chưa có chuyên ngành</span>
                      )}
                    </Descriptions.Item>
                  )}
                  {user.teacherCode && (
                    <Descriptions.Item label="Mã giảng viên">
                      {user.teacherCode}
                    </Descriptions.Item>
                  )}
                  {user.hireDate && (
                    <Descriptions.Item label="Ngày vào trường">
                      {dayjs(user.hireDate).format("DD/MM/YYYY")}
                    </Descriptions.Item>
                  )}
                  {user.phoneNumber && (
                    <Descriptions.Item label="Số điện thoại">
                      {user.phoneNumber}
                    </Descriptions.Item>
                  )}
                  </Descriptions>
              </Card>
            </div>

            {student && (
              <Card
                className="info-card activities-card"
                title="Hoạt động lớp học"
              >
                <div className="activities-columns">
                  <div className="activities-list">
                    <h4>Lớp đang học</h4>
                    {highlightedClasses.length > 0 ? (
                      highlightedClasses.map((cls) => (
                        <div key={cls.classId} className="list-item">
                          <div>
                            <strong>{cls.classCode}</strong>
                            <p>{cls.subjectName}</p>
                          </div>
                          <div className="list-meta">
                            <span>{cls.teacherName}</span>
                            <span>
                              {dayjs(cls.joinedAt).format("DD/MM/YYYY")}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <Empty description="Chưa có lớp đang học" />
                    )}
                  </div>
                  <div className="activities-list">
                    <h4>Đăng ký gần đây</h4>
                    {highlightedEnrollments.length > 0 ? (
                      highlightedEnrollments.map((enroll) => (
                        <div key={enroll.id} className="list-item">
                          <div>
                            <strong>{enroll.classCode}</strong>
                            <p>{enroll.subjectName}</p>
                          </div>
                          <div className="list-meta">
                            <Tag
                              color={enroll.isApproved ? "success" : "warning"}
                            >
                              {enroll.isApproved ? "Đã duyệt" : "Chờ duyệt"}
                            </Tag>
                            <span>
                              {dayjs(enroll.registeredAt).format("DD/MM/YYYY")}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <Empty description="Chưa có đăng ký nào" />
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>
        ) : (
          <Empty description="Không tìm thấy người dùng" />
        )}
      </Spin>
    </div>
  );
};

export default StudentDetailPage;
