import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Select,
  DatePicker,
  Space,
  Avatar,
  Tag,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Statistic,
  Progress,
  Alert,
  Checkbox,
  message,
  Tooltip,
  Badge,
} from "antd";
import {
  
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  BookOutlined,
  TeamOutlined,
  SaveOutlined,
  EyeOutlined,
  EditOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import "./index.scss";

const { Option } = Select;
const { TextArea } = Input;

interface Student {
  id: string;
  studentId: string;
  name: string;
  avatar?: string;
  email: string;
  phone: string;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  classId: string;
  status: "present" | "absent" | "late" | "excused";
  note?: string;
  checkedAt?: string;
}

interface ClassSession {
  id: string;
  name: string;
  subject: string;
  date: string;
  time: string;
  room: string;
  totalStudents: number;
}

const TeacherAttendance: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string>("1");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Mock data
  const classes: ClassSession[] = [
    {
      id: "1",
      name: "CNTT2023A",
      subject: "Toán cao cấp A1",
      date: dayjs().format("YYYY-MM-DD"),
      time: "08:00 - 09:30",
      room: "A101",
      totalStudents: 35,
    },
    {
      id: "2",
      name: "CNTT2023B",
      subject: "Cấu trúc dữ liệu",
      date: dayjs().format("YYYY-MM-DD"),
      time: "10:00 - 11:30",
      room: "B205",
      totalStudents: 32,
    },
    {
      id: "3",
      name: "CNTT2022A",
      subject: "Lập trình Java",
      date: dayjs().format("YYYY-MM-DD"),
      time: "14:00 - 15:30",
      room: "C301",
      totalStudents: 28,
    },
  ];

  const students: Student[] = [
    {
      id: "1",
      studentId: "BaoHGSE170118",
      name: "Huỳnh Gia Bảo",
      email: "bao.huynh@student.edu.vn",
      phone: "0123456789",
    },
    {
      id: "2",
      studentId: "AnNVSE170119",
      name: "Nguyễn Văn An",
      email: "an.nguyen@student.edu.vn",
      phone: "0123456790",
    },
    {
      id: "3",
      studentId: "LinhTTSE170120",
      name: "Trần Thị Linh",
      email: "linh.tran@student.edu.vn",
      phone: "0123456791",
    },
    {
      id: "4",
      studentId: "DucLESE170121",
      name: "Lê Minh Đức",
      email: "duc.le@student.edu.vn",
      phone: "0123456792",
    },
    {
      id: "5",
      studentId: "HoaPTSE170122",
      name: "Phạm Thị Hoa",
      email: "hoa.pham@student.edu.vn",
      phone: "0123456793",
    },
  ];

  // Initialize attendance records
  React.useEffect(() => {
    const initialRecords: AttendanceRecord[] = students.map((student) => ({
      id: `${student.id}_${selectedClass}_${selectedDate.format("YYYY-MM-DD")}`,
      studentId: student.id,
      date: selectedDate.format("YYYY-MM-DD"),
      classId: selectedClass,
      status: "present",
    }));
    setAttendanceRecords(initialRecords);
  }, [selectedClass, selectedDate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "success";
      case "absent":
        return "error";
      case "late":
        return "warning";
      case "excused":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "present":
        return "Có mặt";
      case "absent":
        return "Vắng mặt";
      case "late":
        return "Đi muộn";
      case "excused":
        return "Có phép";
      default:
        return "";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircleOutlined />;
      case "absent":
        return <CloseCircleOutlined />;
      case "late":
        return <ClockCircleOutlined />;
      case "excused":
        return <ExclamationCircleOutlined />;
      default:
        return null;
    }
  };

  const updateAttendance = (studentId: string, status: string) => {
    setAttendanceRecords((prev) =>
      prev.map((record) =>
        record.studentId === studentId
          ? {
              ...record,
              status: status as any,
              checkedAt: dayjs().format("HH:mm:ss"),
            }
          : record
      )
    );
  };

  const handleSaveAttendance = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success("Điểm danh đã được lưu thành công!");
    } catch (error) {
      message.error("Có lỗi xảy ra khi lưu điểm danh!");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAttendance = (status: string) => {
    setAttendanceRecords((prev) =>
      prev.map((record) => ({
        ...record,
        status: status as any,
        checkedAt: dayjs().format("HH:mm:ss"),
      }))
    );
    message.success(
      `Đã cập nhật tất cả sinh viên thành "${getStatusText(status)}"`
    );
  };

  const columns: ColumnsType<Student> = [
    {
      title: "STT",
      key: "index",
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: "Sinh viên",
      key: "student",
      render: (_, student) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar size="large" style={{ backgroundColor: "#1890ff" }}>
            {student.name.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{student.name}</div>
            <div style={{ fontSize: 12, color: "#8c8c8c" }}>
              {student.studentId}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, student) => {
        const record = attendanceRecords.find(
          (r) => r.studentId === student.id
        );
        return (
          <Badge
            status={getStatusColor(record?.status || "present") as any}
            text={
              <span style={{ fontWeight: 500 }}>
                {getStatusText(record?.status || "present")}
              </span>
            }
          />
        );
      },
    },
    {
      title: "Thời gian check",
      key: "checkedAt",
      render: (_, student) => {
        const record = attendanceRecords.find(
          (r) => r.studentId === student.id
        );
        return record?.checkedAt ? (
          <span style={{ color: "#52c41a" }}>{record.checkedAt}</span>
        ) : (
          <span style={{ color: "#8c8c8c" }}>Chưa check</span>
        );
      },
    },
    {
      title: "Điểm danh",
      key: "actions",
      render: (_, student) => (
        <Space>
          <Tooltip title="Có mặt">
            <Button
              type={
                attendanceRecords.find((r) => r.studentId === student.id)
                  ?.status === "present"
                  ? "primary"
                  : "default"
              }
              icon={<CheckCircleOutlined />}
              onClick={() => updateAttendance(student.id, "present")}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Vắng mặt">
            <Button
              danger={
                attendanceRecords.find((r) => r.studentId === student.id)
                  ?.status === "absent"
              }
              icon={<CloseCircleOutlined />}
              onClick={() => updateAttendance(student.id, "absent")}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Đi muộn">
            <Button
              type={
                attendanceRecords.find((r) => r.studentId === student.id)
                  ?.status === "late"
                  ? "primary"
                  : "default"
              }
              icon={<ClockCircleOutlined />}
              onClick={() => updateAttendance(student.id, "late")}
              size="small"
              style={{
                backgroundColor:
                  attendanceRecords.find((r) => r.studentId === student.id)
                    ?.status === "late"
                    ? "#fa8c16"
                    : undefined,
              }}
            />
          </Tooltip>
          <Tooltip title="Có phép">
            <Button
              icon={<ExclamationCircleOutlined />}
              onClick={() => updateAttendance(student.id, "excused")}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Ghi chú">
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedStudent(student);
                setModalVisible(true);
              }}
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const selectedClassInfo = classes.find((c) => c.id === selectedClass);

  const attendanceStats = {
    present: attendanceRecords.filter((r) => r.status === "present").length,
    absent: attendanceRecords.filter((r) => r.status === "absent").length,
    late: attendanceRecords.filter((r) => r.status === "late").length,
    excused: attendanceRecords.filter((r) => r.status === "excused").length,
  };

  const attendanceRate = selectedClassInfo
    ? (attendanceStats.present / selectedClassInfo.totalStudents) * 100
    : 0;

  return (
    <div className="teacher-attendance">
      <div className="attendance-header">
        <h1>Điểm danh lớp học</h1>
        <div className="attendance-controls">
          <Space>
            <Select
              value={selectedClass}
              onChange={setSelectedClass}
              style={{ width: 200 }}
              placeholder="Chọn lớp học"
            >
              {classes.map((cls) => (
                <Option key={cls.id} value={cls.id}>
                  {cls.name} - {cls.subject}
                </Option>
              ))}
            </Select>
            <DatePicker
              value={selectedDate}
              onChange={(date) => date && setSelectedDate(date)}
              format="DD/MM/YYYY"
            />
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveAttendance}
              loading={loading}
            >
              Lưu điểm danh
            </Button>
          </Space>
        </div>
      </div>

      {selectedClassInfo && (
        <Alert
          message={`Lớp: ${selectedClassInfo.name} - ${selectedClassInfo.subject}`}
          description={`Thời gian: ${selectedClassInfo.time} | Phòng: ${
            selectedClassInfo.room
          } | Ngày: ${selectedDate.format("DD/MM/YYYY")}`}
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Có mặt"
              value={attendanceStats.present}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Vắng mặt"
              value={attendanceStats.absent}
              valueStyle={{ color: "#f5222d" }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Đi muộn"
              value={attendanceStats.late}
              valueStyle={{ color: "#fa8c16" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <div style={{ textAlign: "center" }}>
              <Progress
                type="circle"
                percent={Math.round(attendanceRate)}
                format={(percent) => `${percent}%`}
                size={60}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: "#8c8c8c" }}>
                Tỷ lệ tham gia
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Bulk Actions */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space>
          <span style={{ fontWeight: 500 }}>Thao tác hàng loạt:</span>
          <Button
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => handleBulkAttendance("present")}
          >
            Tất cả có mặt
          </Button>
          <Button
            size="small"
            icon={<CloseCircleOutlined />}
            onClick={() => handleBulkAttendance("absent")}
          >
            Tất cả vắng mặt
          </Button>
          <Button
            size="small"
            icon={<ClockCircleOutlined />}
            onClick={() => handleBulkAttendance("late")}
          >
            Tất cả đi muộn
          </Button>
        </Space>
      </Card>

      {/* Attendance Table */}
      <Card>
        <Table
          dataSource={students}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="middle"
          rowClassName={(record) => {
            const attendance = attendanceRecords.find(
              (r) => r.studentId === record.id
            );
            return `attendance-row attendance-${
              attendance?.status || "present"
            }`;
          }}
        />
      </Card>

      {/* Note Modal */}
      <Modal
        title="Ghi chú điểm danh"
        open={modalVisible}
        onOk={() => {
          form.validateFields().then((values) => {
            setAttendanceRecords((prev) =>
              prev.map((record) =>
                record.studentId === selectedStudent?.id
                  ? { ...record, note: values.note }
                  : record
              )
            );
            message.success("Ghi chú đã được lưu!");
            setModalVisible(false);
            form.resetFields();
          });
        }}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={500}
      >
        {selectedStudent && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Avatar size="large" style={{ backgroundColor: "#1890ff" }}>
                {selectedStudent.name.charAt(0)}
              </Avatar>
              <span style={{ marginLeft: 12, fontSize: 16, fontWeight: 500 }}>
                {selectedStudent.name}
              </span>
            </div>
            <Form form={form} layout="vertical">
              <Form.Item
                name="note"
                label="Ghi chú"
                initialValue={
                  attendanceRecords.find(
                    (r) => r.studentId === selectedStudent.id
                  )?.note
                }
              >
                <TextArea
                  rows={4}
                  placeholder="Nhập ghi chú cho sinh viên này..."
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeacherAttendance;
