import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  Table,
  Button,
  Tag,
  Descriptions,
  Spin,
  Typography,
  Modal,
  Space,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ArrowLeftOutlined,
  UserOutlined,
  BookOutlined,
  CalendarOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  getClassByIdApi,
  getClassRosterApi,
  type StudentRoster,
} from "../../../services/admin/classes/api";
import {
  approveEnrollmentApi,
  fetchEnrollmentsByClassApi,
  rejectEnrollmentApi,
  type EnrollmentRequest,
} from "../../../services/admin/enrollments/api";
import type { ClassSummary } from "../../../types/Class";
import "./ClassDetail.scss";

const { Title } = Typography;

const ClassDetail: React.FC = () => {
  const { classCode } = useParams<{ classCode: string }>();
  const [searchParams] = useSearchParams();
  const classId = searchParams.get("id");
  const navigate = useNavigate();
  const [classInfo, setClassInfo] = useState<ClassSummary | null>(null);
  const [students, setStudents] = useState<StudentRoster[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [enrollments, setEnrollments] = useState<EnrollmentRequest[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState<boolean>(false);
  const [isEnrollmentsModalOpen, setIsEnrollmentsModalOpen] =
    useState<boolean>(false);
  const [rejectModal, setRejectModal] = useState<{
    visible: boolean;
    id: string | null;
  }>({ visible: false, id: null });
  const [rejectReason, setRejectReason] = useState<string>("");

  const loadClassDetail = useCallback(
    async (id: string, options?: { showLoading?: boolean }) => {
      const shouldShowLoading = options?.showLoading ?? true;
      if (shouldShowLoading) {
        setLoading(true);
      }
      try {
        const [classData, rosterData] = await Promise.all([
          getClassByIdApi(id),
          getClassRosterApi(id),
        ]);
        setClassInfo(classData);
        setStudents(rosterData);
      } catch {
        toast.error("Không thể tải thông tin lớp học");
        navigate("/admin/classes");
      } finally {
        if (shouldShowLoading) {
          setLoading(false);
        }
      }
    },
    [navigate]
  );

  const loadEnrollments = useCallback(async (id: string) => {
    setEnrollmentsLoading(true);
    try {
      const data = await fetchEnrollmentsByClassApi(id);
      const pendingEnrollments = data.filter(
        (item) => item.status?.toLowerCase() === "pending"
      );
      setEnrollments(pendingEnrollments);
    } catch {
      toast.error("Không thể tải danh sách đơn đăng ký");
    } finally {
      setEnrollmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!classId) {
      toast.error("Không tìm thấy thông tin lớp học");
      navigate("/admin/classes");
      return;
    }

    loadClassDetail(classId);
  }, [classId, loadClassDetail, navigate]);

  const handleOpenEnrollmentsModal = () => {
    if (!classId) {
      toast.error("Không tìm thấy thông tin lớp học");
      return;
    }
    // Gọi API mỗi lần mở modal để bạn thấy request trong Network
    loadEnrollments(classId);
    setIsEnrollmentsModalOpen(true);
  };

  const handleApprove = async (record: EnrollmentRequest) => {
    try {
      await approveEnrollmentApi(record.id);
      toast.success("Duyệt đơn đăng ký thành công");

      setEnrollments((prev) => prev.filter((item) => item.id !== record.id));
      setStudents((prev) => {
        const exists = prev.some((student) => student.id === record.studentId);
        if (exists) {
          return prev;
        }
        return [
          ...prev,
          {
            id: record.studentId,
            studentId: record.studentId,
            studentCode: record.studentCode,
            fullName: record.studentName,
            email: record.studentEmail,
            enrollmentDate: record.registeredAt,
          },
        ];
      });
      setClassInfo((prev) =>
        prev
          ? {
              ...prev,
              totalStudents: prev.totalStudents + 1,
              totalSlots: Math.max(prev.totalSlots - 1, 0),
            }
          : prev
      );

      if (classId) {
        await loadEnrollments(classId);
        await loadClassDetail(classId, { showLoading: false });
      }
    } catch {
      toast.error("Không thể duyệt đơn đăng ký");
    }
  };

  const handleReject = (record: EnrollmentRequest) => {
    setRejectModal({ visible: true, id: record.id });
    setRejectReason("");
  };

  const handleConfirmReject = async () => {
    if (!rejectModal.id || !rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }
    try {
      await rejectEnrollmentApi(rejectModal.id, rejectReason.trim());
      toast.success("Từ chối đơn đăng ký thành công");
      setRejectModal({ visible: false, id: null });
      setRejectReason("");
      if (classId) {
        await loadEnrollments(classId);
      }
    } catch {
      toast.error("Không thể từ chối đơn đăng ký");
    }
  };

  const columns: ColumnsType<StudentRoster> = [
    {
      title: "Mã sinh viên",
      dataIndex: "studentCode",
      key: "studentCode",
      width: 150,
      render: (code: string) => (
        <div className="student-code">
          <UserOutlined className="student-icon" />
          <span>{code}</span>
        </div>
      ),
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      width: 250,
      render: (name: string) => <span className="student-name">{name}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 250,
      render: (email: string) => <span className="student-email">{email}</span>,
    },
    {
      title: "Ngày đăng ký",
      dataIndex: "enrollmentDate",
      key: "enrollmentDate",
      width: 150,
      render: (date?: string) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
  ];

  const enrollmentColumns: ColumnsType<EnrollmentRequest> = [
    {
      title: "Mã sinh viên",
      dataIndex: "studentCode",
      key: "studentCode",
      width: 130,
    },
    {
      title: "Họ và tên",
      dataIndex: "studentName",
      key: "studentName",
      width: 200,
    },
    {
      title: "Email",
      dataIndex: "studentEmail",
      key: "studentEmail",
      width: 220,
    },
    {
      title: "Thời gian đăng ký",
      dataIndex: "registeredAt",
      key: "registeredAt",
      width: 180,
      render: (date?: string) =>
        date ? new Date(date).toLocaleString("vi-VN") : "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 160,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            onClick={() => handleApprove(record)}
          >
            Duyệt
          </Button>
          <Button danger size="small" onClick={() => handleReject(record)}>
            Từ chối
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="class-detail-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!classInfo) {
    return null;
  }

  return (
    <div className="class-detail">
      <div className="class-detail-header">
        <div className="header-left">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/classes")}
            className="back-button"
          >
            Quay lại
          </Button>
          <Title level={2} className="page-title">
            {classCode ? `Chi tiết lớp ${classCode}` : "Chi tiết lớp học"}
          </Title>
        </div>
        <Button type="primary" onClick={handleOpenEnrollmentsModal}>
          Danh sách đơn
        </Button>
      </div>

      <Card className="class-info-card">
        <div className="class-info-header">
          <div className="class-icon-wrapper">
            <BookOutlined />
          </div>
          <div className="class-info-content">
            <Title level={3} className="class-name">
              {classInfo.classCode}
            </Title>
            <p className="class-subject">
              {classInfo.subjectCode} - {classInfo.subjectName}
            </p>
          </div>
        </div>

        <Descriptions
          bordered
          column={{ xxl: 4, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
          className="class-descriptions"
        >
          <Descriptions.Item
            label={
              <span>
                <UserOutlined /> Giảng viên
              </span>
            }
          >
            {classInfo.teacherName} ({classInfo.teacherCode})
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span>
                <CalendarOutlined /> Kỳ học
              </span>
            }
          >
            <Tag color="blue">{classInfo.semesterName}</Tag>
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span>
                <BookOutlined /> Tín chỉ
              </span>
            }
          >
            {classInfo.credits}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span>
                <TeamOutlined /> Sĩ số
              </span>
            }
          >
            {classInfo.totalStudents} sinh viên
          </Descriptions.Item>
          <Descriptions.Item label="Đăng ký">
            {classInfo.totalEnrollments} lượt
          </Descriptions.Item>
          <Descriptions.Item label="Chỗ trống">
            {classInfo.totalSlots} chỗ
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card className="students-card">
        <div className="students-header">
          <Title level={4} className="students-title">
            Danh sách sinh viên ({students.length})
          </Title>
        </div>
        <Table
          columns={columns}
          dataSource={students}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} sinh viên`,
            size: "small",
          }}
          scroll={{ x: 800 }}
          size="small"
        />
      </Card>

      <Modal
        title="Danh sách đơn đăng ký chờ duyệt"
        open={isEnrollmentsModalOpen}
        onCancel={() => setIsEnrollmentsModalOpen(false)}
        footer={null}
        width={900}
      >
        <Table
          columns={enrollmentColumns}
          dataSource={enrollments}
          rowKey="id"
          loading={enrollmentsLoading}
          pagination={{
            pageSize: 10,
            size: "small",
          }}
          size="small"
        />
      </Modal>

      <Modal
        title="Lý do từ chối"
        open={rejectModal.visible}
        onOk={handleConfirmReject}
        onCancel={() => setRejectModal({ visible: false, id: null })}
        okText="Xác nhận từ chối"
        cancelText="Hủy"
      >
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Nhập lý do từ chối..."
          style={{ width: "100%", minHeight: 80 }}
        />
      </Modal>
    </div>
  );
};

export default ClassDetail;
