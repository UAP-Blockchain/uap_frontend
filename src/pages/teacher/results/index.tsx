import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Select,
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
  Descriptions,
  Timeline,
  Divider,
} from "antd";
import {
  TrophyOutlined,
  SaveOutlined,
  EyeOutlined,
  EditOutlined,
  BarChartOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  BookOutlined,
  TeamOutlined,
  CalendarOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import "./index.scss";

const { Option } = Select;
const { TabPane } = Tabs;

interface Student {
  id: string;
  studentId: string;
  name: string;
  avatar?: string;
  email: string;
}

interface GradeComponent {
  id: string;
  name: string;
  type: "homework" | "quiz" | "midterm" | "final" | "project";
  weight: number;
  maxScore: number;
}

interface StudentResult {
  id: string;
  studentId: string;
  semester: string;
  classId: string;
  grades: {
    [componentId: string]: {
      score: number;
      maxScore: number;
      submittedAt?: string;
    };
  };
  finalGrade?: number;
  letterGrade?: string;
  gpa?: number;
  status: "in_progress" | "completed" | "failed" | "withdrawn";
  lastUpdated: string;
}

const TeacherResults: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string>("1");
  const [selectedSemester, setSelectedSemester] = useState<string>("2024-1");
  const [results, setResults] = useState<StudentResult[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("results");

  // Mock data
  const classes = [
    { id: "1", name: "CNTT2023A", subject: "Toán cao cấp A1" },
    { id: "2", name: "CNTT2023B", subject: "Cấu trúc dữ liệu" },
    { id: "3", name: "CNTT2022A", subject: "Lập trình Java" },
  ];

  const semesters = [
    { id: "2024-1", name: "Học kỳ 1 - 2024" },
    { id: "2023-2", name: "Học kỳ 2 - 2023" },
    { id: "2023-1", name: "Học kỳ 1 - 2023" },
  ];

  const gradeComponents: GradeComponent[] = [
    { id: "1", name: "Bài tập", type: "homework", weight: 20, maxScore: 10 },
    { id: "2", name: "Kiểm tra", type: "quiz", weight: 20, maxScore: 10 },
    { id: "3", name: "Giữa kỳ", type: "midterm", weight: 30, maxScore: 10 },
    { id: "4", name: "Cuối kỳ", type: "final", weight: 30, maxScore: 10 },
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

  // Initialize results
  React.useEffect(() => {
    const initialResults: StudentResult[] = students.map((student) => {
      const grades: { [key: string]: { score: number; maxScore: number } } = {};
      gradeComponents.forEach((component) => {
        grades[component.id] = {
          score:
            Math.floor(Math.random() * component.maxScore * 0.8) +
            component.maxScore * 0.2,
          maxScore: component.maxScore,
        };
      });

      // Calculate final grade
      let totalWeightedScore = 0;
      let totalWeight = 0;
      gradeComponents.forEach((component) => {
        const grade = grades[component.id];
        if (grade) {
          totalWeightedScore +=
            (grade.score / grade.maxScore) * component.weight;
          totalWeight += component.weight;
        }
      });

      const finalGrade =
        totalWeight > 0 ? (totalWeightedScore / totalWeight) * 10 : 0;
      const letterGrade = getLetterGrade(finalGrade);

      return {
        id: `${student.id}_${selectedClass}_${selectedSemester}`,
        studentId: student.id,
        semester: selectedSemester,
        classId: selectedClass,
        grades,
        finalGrade,
        letterGrade,
        gpa: convertToGPA(finalGrade),
        status: finalGrade >= 5 ? "completed" : "failed",
        lastUpdated: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      };
    });
    setResults(initialResults);
  }, [selectedClass, selectedSemester]);

  const getLetterGrade = (score: number): string => {
    if (score >= 9) return "A+";
    if (score >= 8.5) return "A";
    if (score >= 8) return "B+";
    if (score >= 7) return "B";
    if (score >= 6.5) return "C+";
    if (score >= 5.5) return "C";
    if (score >= 5) return "D+";
    if (score >= 4) return "D";
    return "F";
  };

  const convertToGPA = (score: number): number => {
    if (score >= 9) return 4.0;
    if (score >= 8.5) return 3.7;
    if (score >= 8) return 3.3;
    if (score >= 7) return 3.0;
    if (score >= 6.5) return 2.7;
    if (score >= 5.5) return 2.3;
    if (score >= 5) return 2.0;
    if (score >= 4) return 1.0;
    return 0.0;
  };

  const getGradeColor = (letterGrade: string): string => {
    switch (letterGrade) {
      case "A+":
      case "A":
        return "success";
      case "B+":
      case "B":
        return "processing";
      case "C+":
      case "C":
        return "warning";
      case "D+":
      case "D":
        return "error";
      case "F":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "success";
      case "in_progress":
        return "processing";
      case "failed":
        return "error";
      case "withdrawn":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "in_progress":
        return "Đang học";
      case "failed":
        return "Không đạt";
      case "withdrawn":
        return "Rút môn";
      default:
        return "";
    }
  };

  const updateResult = (studentId: string, updates: Partial<StudentResult>) => {
    setResults((prev) =>
      prev.map((result) =>
        result.studentId === studentId
          ? {
              ...result,
              ...updates,
              lastUpdated: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            }
          : result
      )
    );
  };

  const handleSaveResults = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success("Kết quả học tập đã được lưu thành công!");
    } catch (error) {
      message.error("Có lỗi xảy ra khi lưu kết quả!");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeResults = () => {
    Modal.confirm({
      title: "Xác nhận hoàn thành kết quả",
      content:
        "Bạn có chắc chắn muốn hoàn thành và khóa kết quả học tập cho lớp này không?",
      onOk: () => {
        setResults((prev) =>
          prev.map((result) => ({
            ...result,
            status:
              result.finalGrade && result.finalGrade >= 5
                ? "completed"
                : "failed",
            lastUpdated: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          }))
        );
        message.success("Đã hoàn thành kết quả học tập!");
      },
    });
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
    ...gradeComponents.map((component) => ({
      title: `${component.name} (${component.weight}%)`,
      key: component.id,
      render: (_: any, student: Student) => {
        const result = results.find((r) => r.studentId === student.id);
        const grade = result?.grades[component.id];
        return grade ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 500 }}>
              {grade.score.toFixed(1)}/{grade.maxScore}
            </div>
            <Progress
              percent={Math.round((grade.score / grade.maxScore) * 100)}
              size="small"
              showInfo={false}
              strokeColor={
                grade.score / grade.maxScore >= 0.8
                  ? "#52c41a"
                  : grade.score / grade.maxScore >= 0.6
                  ? "#faad14"
                  : "#f5222d"
              }
            />
          </div>
        ) : (
          <span style={{ color: "#8c8c8c" }}>-</span>
        );
      },
      width: 120,
    })),
    {
      title: "Điểm tổng kết",
      key: "finalGrade",
      render: (_, student) => {
        const result = results.find((r) => r.studentId === student.id);
        return result?.finalGrade ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#1890ff" }}>
              {result.finalGrade.toFixed(1)}
            </div>
            <Tag color={getGradeColor(result.letterGrade || "")}>
              {result.letterGrade}
            </Tag>
          </div>
        ) : (
          <span style={{ color: "#8c8c8c" }}>-</span>
        );
      },
      width: 100,
    },
    {
      title: "GPA",
      key: "gpa",
      render: (_, student) => {
        const result = results.find((r) => r.studentId === student.id);
        return result?.gpa ? (
          <div style={{ textAlign: "center", fontWeight: 500 }}>
            {result.gpa.toFixed(1)}
          </div>
        ) : (
          <span style={{ color: "#8c8c8c" }}>-</span>
        );
      },
      width: 80,
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, student) => {
        const result = results.find((r) => r.studentId === student.id);
        return (
          <Badge
            status={getStatusColor(result?.status || "in_progress") as any}
            text={getStatusText(result?.status || "in_progress")}
          />
        );
      },
      width: 120,
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, student) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedStudent(student);
                const result = results.find((r) => r.studentId === student.id);
                if (result) {
                  form.setFieldsValue({
                    finalGrade: result.finalGrade,
                    status: result.status,
                  });
                }
                setModalVisible(true);
              }}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button icon={<EditOutlined />} size="small" />
          </Tooltip>
        </Space>
      ),
      width: 100,
    },
  ];

  const selectedClassInfo = classes.find((c) => c.id === selectedClass);
  const selectedSemesterInfo = semesters.find((s) => s.id === selectedSemester);

  const resultStats = {
    total: students.length,
    completed: results.filter((r) => r.status === "completed").length,
    failed: results.filter((r) => r.status === "failed").length,
    inProgress: results.filter((r) => r.status === "in_progress").length,
    averageGrade:
      results.reduce((sum, r) => sum + (r.finalGrade || 0), 0) /
        results.length || 0,
    averageGPA:
      results.reduce((sum, r) => sum + (r.gpa || 0), 0) / results.length || 0,
  };

  return (
    <div className="teacher-results">
      <div className="results-header">
        <h1>Kết quả học tập</h1>
        <div className="results-controls">
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
            <Select
              value={selectedSemester}
              onChange={setSelectedSemester}
              style={{ width: 180 }}
              placeholder="Chọn học kỳ"
            >
              {semesters.map((semester) => (
                <Option key={semester.id} value={semester.id}>
                  {semester.name}
                </Option>
              ))}
            </Select>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveResults}
              loading={loading}
            >
              Lưu kết quả
            </Button>
            <Button
              icon={<CheckCircleOutlined />}
              onClick={handleFinalizeResults}
            >
              Hoàn thành
            </Button>
            <Button icon={<DownloadOutlined />}>Xuất bảng điểm</Button>
          </Space>
        </div>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Bảng điểm" key="results">
          {selectedClassInfo && selectedSemesterInfo && (
            <Alert
              message={`${selectedClassInfo.name} - ${selectedClassInfo.subject}`}
              description={`${
                selectedSemesterInfo.name
              } | Cập nhật lần cuối: ${dayjs().format("DD/MM/YYYY HH:mm")}`}
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
                  title="Tổng số SV"
                  value={resultStats.total}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Đã hoàn thành"
                  value={resultStats.completed}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Điểm TB"
                  value={resultStats.averageGrade.toFixed(1)}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: "#fa8c16" }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="GPA TB"
                  value={resultStats.averageGPA.toFixed(2)}
                  prefix={<BarChartOutlined />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Results Table */}
          <Card>
            <Table
              dataSource={students}
              columns={columns}
              rowKey="id"
              pagination={false}
              size="middle"
              scroll={{ x: 1200 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Thống kê" key="statistics">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
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
                    <div style={{ fontSize: 12, marginTop: 8 }}>
                      Điểm trung bình: {resultStats.averageGrade.toFixed(1)}/10
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Tỷ lệ đậu/rớt" extra={<TrophyOutlined />}>
                <div
                  style={{
                    height: 300,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <Progress
                      type="circle"
                      percent={Math.round(
                        (resultStats.completed / resultStats.total) * 100
                      )}
                      format={(percent) => (
                        <div>
                          <div style={{ fontSize: 20, fontWeight: 600 }}>
                            {percent}%
                          </div>
                          <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                            Tỷ lệ đậu
                          </div>
                        </div>
                      )}
                      size={200}
                    />
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Lịch sử" key="history">
          <Card title="Lịch sử cập nhật kết quả">
            <Timeline>
              <Timeline.Item
                dot={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                color="green"
              >
                <div>
                  <h4>Hoàn thành nhập điểm cuối kỳ</h4>
                  <p>Đã cập nhật điểm cuối kỳ cho tất cả sinh viên</p>
                  <span style={{ color: "#8c8c8c" }}>
                    {dayjs().subtract(1, "day").format("DD/MM/YYYY HH:mm")}
                  </span>
                </div>
              </Timeline.Item>
              <Timeline.Item
                dot={<EditOutlined style={{ color: "#1890ff" }} />}
                color="blue"
              >
                <div>
                  <h4>Cập nhật điểm giữa kỳ</h4>
                  <p>Đã nhập điểm kiểm tra giữa kỳ</p>
                  <span style={{ color: "#8c8c8c" }}>
                    {dayjs().subtract(3, "day").format("DD/MM/YYYY HH:mm")}
                  </span>
                </div>
              </Timeline.Item>
              <Timeline.Item
                dot={<FileTextOutlined style={{ color: "#fa8c16" }} />}
                color="orange"
              >
                <div>
                  <h4>Nhập điểm bài tập</h4>
                  <p>Đã cập nhật điểm bài tập tuần 1-4</p>
                  <span style={{ color: "#8c8c8c" }}>
                    {dayjs().subtract(7, "day").format("DD/MM/YYYY HH:mm")}
                  </span>
                </div>
              </Timeline.Item>
              <Timeline.Item
                dot={<CalendarOutlined style={{ color: "#8c8c8c" }} />}
              >
                <div>
                  <h4>Bắt đầu học kỳ</h4>
                  <p>Khởi tạo bảng điểm cho học kỳ mới</p>
                  <span style={{ color: "#8c8c8c" }}>
                    {dayjs().subtract(30, "day").format("DD/MM/YYYY HH:mm")}
                  </span>
                </div>
              </Timeline.Item>
            </Timeline>
          </Card>
        </TabPane>
      </Tabs>

      {/* Student Detail Modal */}
      <Modal
        title="Chi tiết kết quả học tập"
        open={modalVisible}
        onOk={() => {
          form.validateFields().then((values) => {
            if (selectedStudent) {
              updateResult(selectedStudent.id, values);
              message.success("Đã cập nhật kết quả!");
              setModalVisible(false);
            }
          });
        }}
        onCancel={() => setModalVisible(false)}
        width={700}
      >
        {selectedStudent && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Avatar size="large" style={{ backgroundColor: "#1890ff" }}>
                {selectedStudent.name.charAt(0)}
              </Avatar>
              <span style={{ marginLeft: 12, fontSize: 16, fontWeight: 500 }}>
                {selectedStudent.name} - {selectedStudent.studentId}
              </span>
            </div>
            <Divider />

            <Descriptions column={2} bordered>
              {gradeComponents.map((component) => {
                const result = results.find(
                  (r) => r.studentId === selectedStudent.id
                );
                const grade = result?.grades[component.id];
                return (
                  <Descriptions.Item
                    key={component.id}
                    label={`${component.name} (${component.weight}%)`}
                  >
                    {grade ? (
                      <div>
                        <span style={{ fontWeight: 500 }}>
                          {grade.score.toFixed(1)}/{grade.maxScore}
                        </span>
                        <Progress
                          percent={Math.round(
                            (grade.score / grade.maxScore) * 100
                          )}
                          size="small"
                          style={{ marginTop: 4 }}
                        />
                      </div>
                    ) : (
                      <span style={{ color: "#8c8c8c" }}>Chưa có điểm</span>
                    )}
                  </Descriptions.Item>
                );
              })}
            </Descriptions>

            <Divider />

            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="finalGrade" label="Điểm tổng kết">
                    <InputNumber
                      min={0}
                      max={10}
                      step={0.1}
                      style={{ width: "100%" }}
                      precision={1}
                      disabled
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="status" label="Trạng thái">
                    <Select style={{ width: "100%" }}>
                      <Option value="in_progress">Đang học</Option>
                      <Option value="completed">Hoàn thành</Option>
                      <Option value="failed">Không đạt</Option>
                      <Option value="withdrawn">Rút môn</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeacherResults;
