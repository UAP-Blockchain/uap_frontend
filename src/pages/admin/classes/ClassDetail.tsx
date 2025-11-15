import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Descriptions,
  Spin,
  Typography,
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
import type { ClassSummary } from "../../../types/Class";
import "./ClassDetail.scss";

const { Title } = Typography;

const ClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [classInfo, setClassInfo] = useState<ClassSummary | null>(null);
  const [students, setStudents] = useState<StudentRoster[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      loadClassDetail();
    }
  }, [id]);

  const loadClassDetail = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const [classData, rosterData] = await Promise.all([
        getClassByIdApi(id),
        getClassRosterApi(id),
      ]);
      setClassInfo(classData);
      setStudents(rosterData);
    } catch (error) {
      toast.error("Không thể tải thông tin lớp học");
      navigate("/admin/classes");
    } finally {
      setLoading(false);
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
      render: (name: string) => (
        <span className="student-name">{name}</span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 250,
      render: (email: string) => (
        <span className="student-email">{email}</span>
      ),
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
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/admin/classes")}
          className="back-button"
        >
          Quay lại
        </Button>
        <Title level={2} className="page-title">
          Chi tiết lớp học
        </Title>
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
    </div>
  );
};

export default ClassDetail;

