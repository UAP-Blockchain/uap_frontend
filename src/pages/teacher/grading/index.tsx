import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Select,
  Input,
  Space,
  Avatar,
  Tag,
  Modal,
  Form,
  InputNumber,
  Row,
  Col,
  Statistic,
  Progress,
  Alert,
  message,
  Tooltip,
  Badge,
  Tabs,
  Upload,
  Divider,
} from "antd";
import {
  EditOutlined,
  SaveOutlined,
  EyeOutlined,
  FileTextOutlined,
  TrophyOutlined,
  BarChartOutlined,
  UploadOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  BookOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { UploadProps } from "antd";
import "./index.scss";

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface Student {
  id: string;
  studentId: string;
  name: string;
  avatar?: string;
  email: string;
}

interface Assignment {
  id: string;
  name: string;
  type: "homework" | "quiz" | "midterm" | "final" | "project";
  maxScore: number;
  weight: number;
  dueDate: string;
  status: "draft" | "published" | "graded";
  description?: string;
}

interface Grade {
  id: string;
  studentId: string;
  assignmentId: string;
  score: number;
  feedback?: string;
  submittedAt?: string;
  gradedAt?: string;
  status: "not_submitted" | "submitted" | "graded" | "late";
}

const TeacherGrading: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string>("1");
  const [selectedAssignment, setSelectedAssignment] = useState<string>("1");
  const [grades, setGrades] = useState<Grade[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("grading");

  // Mock data
  const classes = [
    { id: "1", name: "CNTT2023A", subject: "Toán cao cấp A1" },
    { id: "2", name: "CNTT2023B", subject: "Cấu trúc dữ liệu" },
    { id: "3", name: "CNTT2022A", subject: "Lập trình Java" },
  ];

  const assignments: Assignment[] = [
    {
      id: "1",
      name: "Bài tập tuần 1",
      type: "homework",
      maxScore: 10,
      weight: 10,
      dueDate: "2024-10-15",
      status: "published",
      description: "Bài tập về tích phân",
    },
    {
      id: "2",
      name: "Quiz chương 2",
      type: "quiz",
      maxScore: 20,
      weight: 15,
      dueDate: "2024-10-20",
      status: "published",
      description: "Kiểm tra 15 phút chương 2",
    },
    {
      id: "3",
      name: "Kiểm tra giữa kỳ",
      type: "midterm",
      maxScore: 100,
      weight: 30,
      dueDate: "2024-11-01",
      status: "graded",
      description: "Kiểm tra giữa kỳ học phần",
    },
    {
      id: "4",
      name: "Đồ án cuối kỳ",
      type: "project",
      maxScore: 100,
      weight: 45,
      dueDate: "2024-12-15",
      status: "draft",
      description: "Đồ án ứng dụng web",
    },
  ];

  const students: Student[] = [
    {
      id: "1",
      studentId: "BaoHGSE170118",
      name: "Huỳnh Gia Bảo",
      email: "bao.huynh@student.edu.vn",
    },
    {
      id: "2",
      studentId: "AnNVSE170119",
      name: "Nguyễn Văn An",
      email: "an.nguyen@student.edu.vn",
    },
    {
      id: "3",
      studentId: "LinhTTSE170120",
      name: "Trần Thị Linh",
      email: "linh.tran@student.edu.vn",
    },
    {
      id: "4",
      studentId: "DucLESE170121",
      name: "Lê Minh Đức",
      email: "duc.le@student.edu.vn",
    },
    {
      id: "5",
      studentId: "HoaPTSE170122",
      name: "Phạm Thị Hoa",
      email: "hoa.pham@student.edu.vn",
    },
  ];

  // Initialize grades
  React.useEffect(() => {
    const initialGrades: Grade[] = students.map((student) => ({
      id: `${student.id}_${selectedAssignment}`,
      studentId: student.id,
      assignmentId: selectedAssignment,
      score: Math.floor(Math.random() * 10) + 1,
      status: Math.random() > 0.2 ? "submitted" : "not_submitted",
      submittedAt: Math.random() > 0.2 ? "2024-10-14 14:30:00" : undefined,
    }));
    setGrades(initialGrades);
  }, [selectedAssignment]);

  const getAssignmentTypeColor = (type: string) => {
    switch (type) {
      case "homework":
        return "blue";
      case "quiz":
        return "green";
      case "midterm":
        return "orange";
      case "final":
        return "red";
      case "project":
        return "purple";
      default:
        return "default";
    }
  };

  const getAssignmentTypeText = (type: string) => {
    switch (type) {
      case "homework":
        return "Bài tập";
      case "quiz":
        return "Kiểm tra";
      case "midterm":
        return "Giữa kỳ";
      case "final":
        return "Cuối kỳ";
      case "project":
        return "Đồ án";
      default:
        return "";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "graded":
        return "success";
      case "submitted":
        return "processing";
      case "not_submitted":
        return "error";
      case "late":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "graded":
        return "Đã chấm";
      case "submitted":
        return "Đã nộp";
      case "not_submitted":
        return "Chưa nộp";
      case "late":
        return "Nộp muộn";
      default:
        return "";
    }
  };

  const updateGrade = (studentId: string, score: number, feedback?: string) => {
    setGrades((prev) =>
      prev.map((grade) =>
        grade.studentId === studentId
          ? {
              ...grade,
              score,
              feedback,
              status: "graded",
              gradedAt: new Date().toISOString(),
            }
          : grade
      )
    );
  };

  const handleSaveGrades = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success("Điểm số đã được lưu thành công!");
    } catch (error) {
      message.error("Có lỗi xảy ra khi lưu điểm!");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickGrade = (studentId: string, score: number) => {
    updateGrade(studentId, score);
    message.success("Đã cập nhật điểm!");
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
        const grade = grades.find((g) => g.studentId === student.id);
        return (
          <Badge
            status={getStatusColor(grade?.status || "not_submitted") as any}
            text={getStatusText(grade?.status || "not_submitted")}
          />
        );
      },
    },
    {
      title: "Điểm số",
      key: "score",
      render: (_, student) => {
        const grade = grades.find((g) => g.studentId === student.id);
        const assignment = assignments.find((a) => a.id === selectedAssignment);

        return (
          <div>
            <InputNumber
              min={0}
              max={assignment?.maxScore || 10}
              value={grade?.score}
              onChange={(value) =>
                value !== null && updateGrade(student.id, value)
              }
              style={{ width: 80 }}
              precision={1}
            />
            <span style={{ marginLeft: 8, color: "#8c8c8c" }}>
              / {assignment?.maxScore || 10}
            </span>
          </div>
        );
      },
    },
    {
      title: "Phần trăm",
      key: "percentage",
      render: (_, student) => {
        const grade = grades.find((g) => g.studentId === student.id);
        const assignment = assignments.find((a) => a.id === selectedAssignment);
        const percentage =
          assignment && grade
            ? Math.round((grade.score / assignment.maxScore) * 100)
            : 0;

        return (
          <div>
            <Progress
              percent={percentage}
              size="small"
              status={
                percentage >= 80
                  ? "success"
                  : percentage >= 60
                  ? "normal"
                  : "exception"
              }
            />
          </div>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, student) => (
        <Space>
          <Tooltip title="Chấm điểm nhanh - 10/10">
            <Button
              size="small"
              onClick={() => handleQuickGrade(student.id, 10)}
            >
              10
            </Button>
          </Tooltip>
          <Tooltip title="Chấm điểm nhanh - 8/10">
            <Button
              size="small"
              onClick={() => handleQuickGrade(student.id, 8)}
            >
              8
            </Button>
          </Tooltip>
          <Tooltip title="Chấm điểm nhanh - 5/10">
            <Button
              size="small"
              onClick={() => handleQuickGrade(student.id, 5)}
            >
              5
            </Button>
          </Tooltip>
          <Tooltip title="Xem chi tiết & nhận xét">
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedStudent(student);
                form.setFieldsValue({
                  score:
                    grades.find((g) => g.studentId === student.id)?.score || 0,
                  feedback:
                    grades.find((g) => g.studentId === student.id)?.feedback ||
                    "",
                });
                setModalVisible(true);
              }}
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const selectedAssignmentInfo = assignments.find(
    (a) => a.id === selectedAssignment
  );
  const selectedClassInfo = classes.find((c) => c.id === selectedClass);

  const gradingStats = {
    total: students.length,
    graded: grades.filter((g) => g.status === "graded").length,
    submitted: grades.filter((g) => g.status === "submitted").length,
    notSubmitted: grades.filter((g) => g.status === "not_submitted").length,
    averageScore:
      grades.reduce((sum, g) => sum + g.score, 0) / grades.length || 0,
  };

  const uploadProps: UploadProps = {
    name: "file",
    action: "/api/upload",
    headers: {
      authorization: "authorization-text",
    },
    onChange(info) {
      if (info.file.status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === "done") {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  return (
    <div className="teacher-grading">
      <div className="grading-header">
        <h1>Chấm điểm & Đánh giá</h1>
        <div className="grading-controls">
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
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveGrades}
              loading={loading}
            >
              Lưu tất cả điểm
            </Button>
            <Button icon={<DownloadOutlined />}>Xuất bảng điểm</Button>
          </Space>
        </div>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Chấm điểm" key="grading">
          {selectedClassInfo && (
            <Alert
              message={`Lớp: ${selectedClassInfo.name} - ${selectedClassInfo.subject}`}
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          {/* Assignment Selection */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16} align="middle">
              <Col>
                <span style={{ fontWeight: 500 }}>Chọn bài tập:</span>
              </Col>
              <Col flex={1}>
                <Select
                  value={selectedAssignment}
                  onChange={setSelectedAssignment}
                  style={{ width: "100%" }}
                  placeholder="Chọn bài tập cần chấm"
                >
                  {assignments.map((assignment) => (
                    <Option key={assignment.id} value={assignment.id}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Tag color={getAssignmentTypeColor(assignment.type)}>
                          {getAssignmentTypeText(assignment.type)}
                        </Tag>
                        {assignment.name} ({assignment.maxScore} điểm -{" "}
                        {assignment.weight}%)
                      </div>
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </Card>

          {selectedAssignmentInfo && (
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 600,
                        color: "#1890ff",
                      }}
                    >
                      {selectedAssignmentInfo.maxScore}
                    </div>
                    <div style={{ color: "#8c8c8c" }}>Điểm tối đa</div>
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 600,
                        color: "#52c41a",
                      }}
                    >
                      {selectedAssignmentInfo.weight}%
                    </div>
                    <div style={{ color: "#8c8c8c" }}>Trọng số</div>
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 600,
                        color: "#fa8c16",
                      }}
                    >
                      {gradingStats.averageScore.toFixed(1)}
                    </div>
                    <div style={{ color: "#8c8c8c" }}>Điểm trung bình</div>
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ textAlign: "center" }}>
                    <Progress
                      type="circle"
                      percent={Math.round(
                        (gradingStats.graded / gradingStats.total) * 100
                      )}
                      size={60}
                      format={(percent) =>
                        `${gradingStats.graded}/${gradingStats.total}`
                      }
                    />
                    <div style={{ color: "#8c8c8c", marginTop: 4 }}>
                      Đã chấm
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          )}

          {/* Grading Table */}
          <Card>
            <Table
              dataSource={students}
              columns={columns}
              rowKey="id"
              pagination={false}
              size="middle"
            />
          </Card>
        </TabPane>

        <TabPane tab="Quản lý bài tập" key="assignments">
          <Card>
            <div style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<FileTextOutlined />}>
                Tạo bài tập mới
              </Button>
              <Upload {...uploadProps} style={{ marginLeft: 16 }}>
                <Button icon={<UploadOutlined />}>Tải lên đề bài</Button>
              </Upload>
            </div>

            <Table
              dataSource={assignments}
              rowKey="id"
              columns={[
                {
                  title: "Tên bài tập",
                  dataIndex: "name",
                  key: "name",
                  render: (name, record) => (
                    <div>
                      <div style={{ fontWeight: 500 }}>{name}</div>
                      <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                        {record.description}
                      </div>
                    </div>
                  ),
                },
                {
                  title: "Loại",
                  dataIndex: "type",
                  key: "type",
                  render: (type) => (
                    <Tag color={getAssignmentTypeColor(type)}>
                      {getAssignmentTypeText(type)}
                    </Tag>
                  ),
                },
                {
                  title: "Điểm tối đa",
                  dataIndex: "maxScore",
                  key: "maxScore",
                },
                {
                  title: "Trọng số",
                  dataIndex: "weight",
                  key: "weight",
                  render: (weight) => `${weight}%`,
                },
                {
                  title: "Hạn nộp",
                  dataIndex: "dueDate",
                  key: "dueDate",
                },
                {
                  title: "Trạng thái",
                  dataIndex: "status",
                  key: "status",
                  render: (status) => (
                    <Badge
                      status={
                        status === "published"
                          ? "success"
                          : status === "graded"
                          ? "processing"
                          : "default"
                      }
                      text={
                        status === "published"
                          ? "Đã phát hành"
                          : status === "graded"
                          ? "Đã chấm xong"
                          : "Nháp"
                      }
                    />
                  ),
                },
                {
                  title: "Thao tác",
                  key: "actions",
                  render: () => (
                    <Space>
                      <Button size="small" icon={<EyeOutlined />}>
                        Xem
                      </Button>
                      <Button size="small" icon={<EditOutlined />}>
                        Sửa
                      </Button>
                    </Space>
                  ),
                },
              ]}
            />
          </Card>
        </TabPane>

        <TabPane tab="Thống kê" key="statistics">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card title="Phân bố điểm số" extra={<BarChartOutlined />}>
                <div
                  style={{
                    height: 300,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ textAlign: "center", color: "#8c8c8c" }}>
                    <BarChartOutlined
                      style={{ fontSize: 48, marginBottom: 16 }}
                    />
                    <div>Biểu đồ phân bố điểm số</div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Tiến độ chấm điểm" extra={<TrophyOutlined />}>
                <div
                  style={{
                    height: 300,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ textAlign: "center", color: "#8c8c8c" }}>
                    <TrophyOutlined
                      style={{ fontSize: 48, marginBottom: 16 }}
                    />
                    <div>Thống kê tiến độ chấm điểm</div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* Grading Detail Modal */}
      <Modal
        title="Chi tiết chấm điểm"
        open={modalVisible}
        onOk={() => {
          form.validateFields().then((values) => {
            if (selectedStudent) {
              updateGrade(selectedStudent.id, values.score, values.feedback);
              message.success("Đã cập nhật điểm và nhận xét!");
              setModalVisible(false);
            }
          });
        }}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        {selectedStudent && selectedAssignmentInfo && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Avatar size="large" style={{ backgroundColor: "#1890ff" }}>
                {selectedStudent.name.charAt(0)}
              </Avatar>
              <span style={{ marginLeft: 12, fontSize: 16, fontWeight: 500 }}>
                {selectedStudent.name}
              </span>
            </div>
            <Divider />
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="score"
                    label="Điểm số"
                    rules={[
                      { required: true, message: "Vui lòng nhập điểm!" },
                      {
                        type: "number",
                        min: 0,
                        max: selectedAssignmentInfo.maxScore,
                        message: `Điểm phải từ 0 đến ${selectedAssignmentInfo.maxScore}`,
                      },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      max={selectedAssignmentInfo.maxScore}
                      style={{ width: "100%" }}
                      precision={1}
                      addonAfter={`/ ${selectedAssignmentInfo.maxScore}`}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Phần trăm">
                    <div style={{ paddingTop: 8 }}>
                      <Progress
                        percent={
                          form.getFieldValue("score")
                            ? Math.round(
                                (form.getFieldValue("score") /
                                  selectedAssignmentInfo.maxScore) *
                                  100
                              )
                            : 0
                        }
                        size="small"
                      />
                    </div>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="feedback" label="Nhận xét">
                <TextArea
                  rows={4}
                  placeholder="Nhập nhận xét cho sinh viên..."
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeacherGrading;
