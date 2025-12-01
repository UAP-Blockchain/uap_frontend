import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Descriptions,
  Divider,
  Empty,
  message,
  Row,
  Col,
  Space,
  Spin,
  Tag,
  Upload,
  Table,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  UploadOutlined,
  ArrowLeftOutlined,
  MailOutlined,
} from "@ant-design/icons";
import type { UploadRequestOption } from "rc-upload/lib/interface";
import { useNavigate, useParams } from "react-router-dom";
import {
  getUserByIdApi,
  uploadUserProfilePictureApi,
} from "../../../services/admin/users/api";
import StudentServices from "../../../services/student/api.service";
import type {
  StudentDetailDto,
  ClassInfo,
  EnrollmentInfo,
} from "../../../types/Student";
import type { UserDto } from "../../../services/admin/users/api";
import dayjs from "dayjs";
import "./detail.scss";

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
        try {
          const studentDetail = await StudentServices.getStudentById(userId);
          setStudent(studentDetail);
        } catch (error) {
          console.error("Failed to load student detail:", error);
          message.error("Không thể tải chi tiết sinh viên");
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
     const res = await uploadUserProfilePictureApi(userId, file as File);

     // Lấy đúng url từ response
     const imageUrl =
       res.data?.imageUrl ?? // nếu service trả { data: { imageUrl } }
       res.data?.data?.imageUrl ?? // nếu axios trả { data: { success, data: { imageUrl } } }
       res.imageUrl; // fallback

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


  const currentClassColumns: ColumnsType<ClassInfo> = [
    {
      title: "Lớp",
      dataIndex: "classCode",
      key: "classCode",
    },
    {
      title: "Môn học",
      dataIndex: "subjectName",
      key: "subjectName",
    },
    {
      title: "GV phụ trách",
      dataIndex: "teacherName",
      key: "teacherName",
    },
    {
      title: "Số tín chỉ",
      dataIndex: "credits",
      key: "credits",
      width: 100,
    },
    {
      title: "Ngày tham gia",
      dataIndex: "joinedAt",
      key: "joinedAt",
      render: (value: string) => dayjs(value).format("DD/MM/YYYY"),
    },
  ];

  const enrollmentColumns: ColumnsType<EnrollmentInfo> = [
    {
      title: "Lớp đăng ký",
      dataIndex: "classCode",
      key: "classCode",
    },
    {
      title: "Môn học",
      dataIndex: "subjectName",
      key: "subjectName",
    },
    {
      title: "Giảng viên",
      dataIndex: "teacherName",
      key: "teacherName",
    },
    {
      title: "Trạng thái",
      dataIndex: "isApproved",
      key: "isApproved",
      render: (isApproved: boolean) => (
        <Tag color={isApproved ? "success" : "warning"}>
          {isApproved ? "Đã duyệt" : "Đang chờ"}
        </Tag>
      ),
    },
    {
      title: "Ngày đăng ký",
      dataIndex: "registeredAt",
      key: "registeredAt",
      render: (value: string) => dayjs(value).format("DD/MM/YYYY"),
    },
  ];

  const statistics = useMemo(() => {
    if (!student) {
      return [];
    }
    return [
      {
        label: "Tổng đăng ký",
        value: student.totalEnrollments,
      },
      {
        label: "Đã duyệt",
        value: student.approvedEnrollments,
      },
      {
        label: "Đang chờ",
        value: student.pendingEnrollments,
      },
      {
        label: "Lớp hiện tại",
        value: student.totalClasses,
      },
      {
        label: "Điểm đã nhập",
        value: student.totalGrades,
      },
      {
        label: "Bản ghi điểm danh",
        value: student.totalAttendances,
      },
    ];
  }, [student]);

  if (!userId) {
    return (
      <div className="user-detail-page">
        <Empty description="Thiếu mã người dùng" />
      </div>
    );
  }

  return (
    <div className="user-detail-page">
      <Button
        icon={<ArrowLeftOutlined />}
        style={{ marginBottom: 16 }}
        onClick={() => navigate(-1)}
      >
        Quay lại
      </Button>

      <Spin spinning={loading}>
        {user ? (
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card className="profile-card">
                <div className="avatar-section">
                  <Avatar
                    size={120}
                    src={user.profilePictureUrl}
                    style={{ backgroundColor: "#1677ff" }}
                  >
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
                      style={{ marginTop: 12 }}
                    >
                      Đổi ảnh
                    </Button>
                  </Upload>
                </div>
                <div className="user-info">
                  <h2>{user.fullName}</h2>
                  <Space>
                    <MailOutlined />
                    <span>{user.email}</span>
                  </Space>
                  <Tag color={user.isActive ? "success" : "default"}>
                    {user.isActive ? "Đang hoạt động" : "Vô hiệu hóa"}
                  </Tag>
                  <Tag>
                    {user.roleName === "Student" ? "Sinh viên" : "Giảng viên"}
                  </Tag>
                </div>
              </Card>

              {statistics.length > 0 && (
                <Card title="Thống kê">
                  <div className="stats-grid">
                    {statistics.map((item) => (
                      <div key={item.label} className="stat-item">
                        <div className="value">{item.value}</div>
                        <div className="label">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </Col>

            <Col xs={24} md={16}>
              <Card title="Thông tin học sinh">
                {student ? (
                  <>
                    <Descriptions column={2} bordered size="small">
                      <Descriptions.Item label="Mã sinh viên">
                        {student.studentCode}
                      </Descriptions.Item>
                      <Descriptions.Item label="GPA">
                        {student.gpa?.toFixed(2)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày nhập học">
                        {dayjs(student.enrollmentDate).format("DD/MM/YYYY")}
                      </Descriptions.Item>
                      <Descriptions.Item label="Trạng thái">
                        <Tag color={student.isActive ? "success" : "default"}>
                          {student.isActive ? "Đang học" : "Tạm ngưng"}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Tốt nghiệp">
                        {student.isGraduated ? (
                          <Tag color="blue">Đã tốt nghiệp</Tag>
                        ) : (
                          <Tag>Chưa tốt nghiệp</Tag>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày tạo">
                        {dayjs(student.createdAt).format("DD/MM/YYYY HH:mm")}
                      </Descriptions.Item>
                    </Descriptions>
                    <Divider />
                    <h3>Lớp đang học</h3>
                    {student.currentClasses &&
                    student.currentClasses.length > 0 ? (
                      <Table<ClassInfo>
                        columns={currentClassColumns}
                        dataSource={student.currentClasses}
                        size="small"
                        rowKey="classId"
                        pagination={false}
                      />
                    ) : (
                      <Empty description="Chưa có lớp đang học" />
                    )}
                    <Divider />
                    <h3>Lịch sử đăng ký</h3>
                    {student.enrollments && student.enrollments.length > 0 ? (
                      <Table<EnrollmentInfo>
                        columns={enrollmentColumns}
                        dataSource={student.enrollments}
                        size="small"
                        rowKey="id"
                        pagination={{ pageSize: 5 }}
                      />
                    ) : (
                      <Empty description="Chưa có đăng ký nào" />
                    )}
                  </>
                ) : (
                  <Empty description="Chỉ áp dụng cho vai trò Sinh viên" />
                )}
              </Card>
            </Col>
          </Row>
        ) : (
          <Empty description="Không tìm thấy người dùng" />
        )}
      </Spin>
    </div>
  );
};

export default StudentDetailPage;
