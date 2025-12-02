import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Button,
  Typography,
  Avatar,
  Space,
  Input,
  Row,
  Col,
  Statistic,
  Tag,
  Badge,
  Spin,
  notification,
  Radio,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import AttendanceServices from "../../../services/attendance/api.service";
import type {
  SlotAttendanceDto,
  StudentAttendanceDetailDto,
} from "../../../types/Attendance";
import "./index.scss";

const { Title, Text } = Typography;
const { Search } = Input;

const TeacherClassStudentList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [api, contextHolder] = notification.useNotification();
  const state = (location.state || {}) as {
    slot?: unknown;
    slotId?: string;
    classId?: string;
    courseCode?: string;
    courseName?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    className?: string;
    room?: string;
    selectedWeek?: string;
  };

  const [searchText, setSearchText] = useState("");
  const [slotAttendance, setSlotAttendance] =
    useState<SlotAttendanceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attendanceData, setAttendanceData] = useState<
    Record<string, { isPresent: boolean; notes?: string }>
  >({});

  useEffect(() => {
    const fetchSlotAttendance = async () => {
      const slotId = state.slotId;
      if (!slotId) {
        api.error({
          message: "Lỗi",
          description: "Không tìm thấy thông tin slot",
          icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
          placement: "topRight",
        });
        // navigate("/teacher/schedule");
        return;
      }

      setLoading(true);
      try {
        const data = await AttendanceServices.getSlotAttendance(slotId);
        setSlotAttendance(data);

        // Initialize attendance data from API response
        // If hasAttendance is false, default all to absent (isPresent = false)
        const initialData: Record<
          string,
          { isPresent: boolean; notes?: string }
        > = {};
        data.studentAttendances.forEach((attendance) => {
          initialData[attendance.studentId] = {
            isPresent: data.hasAttendance ? attendance.isPresent : false,
            notes: attendance.notes || undefined,
          };
        });
        setAttendanceData(initialData);
      } catch (err) {
        const errorMessage =
          (err as { message?: string })?.message ||
          "Không thể tải dữ liệu điểm danh";
        api.error({
          message: "Lỗi tải dữ liệu",
          description: errorMessage,
          icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
          placement: "topRight",
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchSlotAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.slotId, navigate]);

  const handleMarkAllPresent = async () => {
    const slotId = state.slotId;
    if (!slotId || !slotAttendance) {
      api.error({
        message: "Lỗi",
        description: "Không tìm thấy thông tin slot",
        icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
        placement: "topRight",
      });
      return;
    }

    setSavingAttendance(true);
    try {
      await AttendanceServices.markAllPresent(slotId);

      // Update local state
      const updatedData: Record<
        string,
        { isPresent: boolean; notes?: string }
      > = {};
      slotAttendance.studentAttendances.forEach((attendance) => {
        updatedData[attendance.studentId] = {
          isPresent: true,
          notes: attendanceData[attendance.studentId]?.notes,
        };
      });
      setAttendanceData(updatedData);

      api.success({
        message: "Thành công",
        description: `Đã đánh dấu tất cả ${slotAttendance.totalStudents} sinh viên có mặt`,
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        placement: "topRight",
        duration: 3,
      });
    } catch (err) {
      const errorMessage =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Không thể đánh dấu tất cả có mặt";
      api.error({
        message: "Lỗi",
        description: errorMessage,
        icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
        placement: "topRight",
      });
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleMarkAllAbsent = async () => {
    const slotId = state.slotId;
    if (!slotId || !slotAttendance) {
      api.error({
        message: "Lỗi",
        description: "Không tìm thấy thông tin slot",
        icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
        placement: "topRight",
      });
      return;
    }

    setSavingAttendance(true);
    try {
      await AttendanceServices.markAllAbsent(slotId);

      // Update local state
      const updatedData: Record<
        string,
        { isPresent: boolean; notes?: string }
      > = {};
      slotAttendance.studentAttendances.forEach((attendance) => {
        updatedData[attendance.studentId] = {
          isPresent: false,
          notes: attendanceData[attendance.studentId]?.notes,
        };
      });
      setAttendanceData(updatedData);

      api.warning({
        message: "Đã cập nhật",
        description: `Đã đánh dấu tất cả ${slotAttendance.totalStudents} sinh viên vắng`,
        icon: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
        placement: "topRight",
        duration: 3,
      });
    } catch (err) {
      const errorMessage =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Không thể đánh dấu tất cả vắng";
      api.error({
        message: "Lỗi",
        description: errorMessage,
        icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
        placement: "topRight",
      });
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleSaveAttendance = async () => {
    const slotId = state.slotId;
    if (!slotId || !slotAttendance) {
      api.error({
        message: "Lỗi",
        description: "Không tìm thấy thông tin slot",
        icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
        placement: "topRight",
      });
      return;
    }

    setSavingAttendance(true);
    try {
      const students = slotAttendance.studentAttendances.map((attendance) => ({
        studentId: attendance.studentId,
        isPresent: attendanceData[attendance.studentId]?.isPresent ?? false,
        notes: attendanceData[attendance.studentId]?.notes,
      }));

      // Use PUT if already has attendance, POST if new
      if (slotAttendance.hasAttendance) {
        await AttendanceServices.updateSlotAttendance(slotId, students);
      } else {
        await AttendanceServices.takeSlotAttendance(slotId, students);
      }

      const presentCount = students.filter((s) => s.isPresent).length;
      const absentCount = students.length - presentCount;

      api.success({
        message: slotAttendance.hasAttendance
          ? "Cập nhật điểm danh thành công!"
          : "Điểm danh thành công!",
        description: (
          <div>
            <div>
              {slotAttendance.hasAttendance
                ? "Đã cập nhật điểm danh cho"
                : "Đã lưu điểm danh cho"}{" "}
              {slotAttendance.totalStudents} sinh viên
            </div>
            <div style={{ marginTop: 4, fontSize: "12px", color: "#8c8c8c" }}>
              Có mặt: {presentCount} • Vắng: {absentCount}
            </div>
          </div>
        ),
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        placement: "topRight",
        duration: 4,
      });

      // Refresh data after saving
      try {
        const updatedData = await AttendanceServices.getSlotAttendance(slotId);
        setSlotAttendance(updatedData);

        // Update attendance data
        const newAttendanceData: Record<
          string,
          { isPresent: boolean; notes?: string }
        > = {};
        updatedData.studentAttendances.forEach((attendance) => {
          newAttendanceData[attendance.studentId] = {
            isPresent: attendance.isPresent,
            notes: attendance.notes || undefined,
          };
        });
        setAttendanceData(newAttendanceData);
      } catch (refreshErr) {
        // If refresh fails, still navigate
        console.error("Failed to refresh data:", refreshErr);
      }

      // Remain on the class list page after saving so user can continue working
    } catch (err) {
      const errorMessage =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        slotAttendance?.hasAttendance
          ? "Không thể cập nhật điểm danh"
          : "Không thể lưu điểm danh";
      api.error({
        message: "Lỗi",
        description: errorMessage,
        icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
        placement: "topRight",
      });
    } finally {
      setSavingAttendance(false);
    }
  };

  const filtered =
    slotAttendance?.studentAttendances.filter(
      (s) =>
        s.studentCode.toLowerCase().includes(searchText.toLowerCase()) ||
        s.studentName.toLowerCase().includes(searchText.toLowerCase())
    ) || [];

  const columns: ColumnsType<StudentAttendanceDetailDto> = [
    {
      title: "STT",
      key: "index",
      width: 80,
      align: "center" as const,
      render: (_: unknown, __: unknown, index: number) => (
        <span style={{ fontWeight: 500, fontSize: "15px" }}>{index + 1}</span>
      ),
    },
    {
      title: "Ảnh",
      key: "avatar",
      width: 100,
      align: "center" as const,
      render: (_: unknown, record: StudentAttendanceDetailDto) => (
        <Avatar
          size={64}
          src={record.profileImageUrl}
          icon={<UserOutlined />}
          style={{
            background: "#f0f0f0",
            border: "1px solid #d9d9d9",
          }}
        />
      ),
    },
    {
      title: "Mã SV",
      dataIndex: "studentCode",
      key: "studentCode",
      width: 120,
      render: (code: string) => (
        <span style={{ fontWeight: 500, fontSize: "15px" }}>{code}</span>
      ),
    },
    {
      title: "Họ và tên",
      dataIndex: "studentName",
      key: "studentName",
      render: (name: string) => (
        <span style={{ fontSize: "14px" }}>{name}</span>
      ),
    },
    {
      title: "Điểm danh",
      key: "attendance",
      width: 200,
      render: (_: unknown, record: StudentAttendanceDetailDto) => {
        const isPresent = attendanceData[record.studentId]?.isPresent ?? false;
        return (
          <Radio.Group
            value={isPresent}
            onChange={(e) =>
              setAttendanceData((prev) => ({
                ...prev,
                [record.studentId]: {
                  isPresent: e.target.value,
                  notes: prev[record.studentId]?.notes,
                },
              }))
            }
            buttonStyle="solid"
          >
            <Radio.Button value={false}>Vắng</Radio.Button>
            <Radio.Button value={true}>Có mặt</Radio.Button>
          </Radio.Group>
        );
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 150,
      render: (_: unknown, record: StudentAttendanceDetailDto) => {
        const status = attendanceData[record.studentId]?.isPresent ?? false;
        return (
          <Badge
            status={status ? "success" : "error"}
            text={
              <span style={{ fontWeight: 500 }}>
                {status ? "Có mặt" : "Vắng"}
                {record.isExcused && (
                  <Tag color="orange" style={{ marginLeft: 8 }}>
                    Có phép
                  </Tag>
                )}
              </span>
            }
          />
        );
      },
    },
    {
      title: "Ghi chú",
      key: "notes",
      width: 200,
      render: (_: unknown, record: StudentAttendanceDetailDto) => {
        return (
          <Input
            placeholder="Ghi chú (tùy chọn)"
            value={
              attendanceData[record.studentId]?.notes || record.notes || ""
            }
            onChange={(e) =>
              setAttendanceData((prev) => ({
                ...prev,
                [record.studentId]: {
                  isPresent:
                    prev[record.studentId]?.isPresent ?? record.isPresent,
                  notes: e.target.value,
                },
              }))
            }
            size="small"
          />
        );
      },
    },
  ];

  return (
    <>
      {contextHolder}
      <div className="teacher-class-student-list">
        <div className="list-header">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => {
              if (state.selectedWeek) {
                navigate("/teacher/schedule", {
                  state: { selectedWeek: state.selectedWeek },
                });
              } else {
                navigate(-1);
              }
            }}
            style={{ marginBottom: 16 }}
          >
            Quay lại lịch giảng dạy
          </Button>

          <div className="attendance-header">
            <div className="attendance-header-content">
              <div className="attendance-title-section">
                <Text className="attendance-label">ĐIỂM DANH</Text>
                <Title level={2} style={{ margin: 0 }}>
                  {slotAttendance?.hasAttendance && (
                    <Tag
                      color="success"
                      style={{
                        fontSize: 14,
                        padding: "2px 12px",
                      }}
                    >
                      Đã điểm danh
                    </Tag>
                  )}
                </Title>
                <Space direction="vertical" size={4}>
                  <Text className="attendance-subtitle-main">
                    {slotAttendance?.subjectName ||
                      state.courseName ||
                      state.className ||
                      "Class"}
                  </Text>
                  <Text className="attendance-subtitle-secondary">
                    {slotAttendance?.date && (
                      <>{dayjs(slotAttendance.date).format("DD/MM/YYYY")}</>
                    )}
                    {slotAttendance?.date && slotAttendance?.timeSlotName && (
                      <> • </>
                    )}
                    {slotAttendance?.timeSlotName && (
                      <>{slotAttendance.timeSlotName}</>
                    )}
                  </Text>
                </Space>
              </div>
              <div className="attendance-metrics">
                <Card className="metric-card compact">
                  <Statistic
                    title="Tổng số sinh viên"
                    value={slotAttendance?.totalStudents || 0}
                    prefix={<TeamOutlined style={{ color: "#1a94fc" }} />}
                  />
                </Card>
                <Card className="metric-card compact">
                  <Statistic
                    title="Tỷ lệ điểm danh"
                    value={slotAttendance?.attendanceRate || 0}
                    suffix="%"
                    prefix={<BookOutlined style={{ color: "#1a94fc" }} />}
                  />
                </Card>
                <Card className="metric-card compact present-card">
                  <Statistic
                    title="Có mặt"
                    value={slotAttendance?.presentCount || 0}
                    prefix={
                      <CheckCircleOutlined style={{ color: "#52c41a" }} />
                    }
                  />
                </Card>
                <Card className="metric-card compact absent-card">
                  <Statistic
                    title="Vắng"
                    value={slotAttendance?.absentCount || 0}
                    prefix={
                      <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                    }
                  />
                </Card>
              </div>
            </div>
          </div>
        </div>

        <div className="table-actions-bar">
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} sm={12} md={10}>
              <div className="search-wrapper">
                <Search
                  placeholder="Tìm kiếm sinh viên..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={(value) => setSearchText(value)}
                  className="attendance-search"
                  allowClear
                  enterButton
                  size="large"
                />
              </div>
            </Col>
            <Col xs={24} sm={12} md={14}>
              <Space wrap size="middle">
                <Button
                  onClick={handleMarkAllPresent}
                  loading={savingAttendance}
                  disabled={
                    !state.slotId ||
                    !slotAttendance ||
                    slotAttendance.hasAttendance
                  }
                  className="mark-all-present-btn"
                  size="large"
                >
                  Tất cả có mặt
                </Button>
                <Button
                  onClick={handleMarkAllAbsent}
                  loading={savingAttendance}
                  disabled={
                    !state.slotId ||
                    !slotAttendance ||
                    slotAttendance.hasAttendance
                  }
                  className="mark-all-absent-btn"
                  size="large"
                >
                  Tất cả vắng
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={savingAttendance}
                  onClick={handleSaveAttendance}
                  disabled={!state.slotId || !slotAttendance}
                  size="large"
                >
                  {slotAttendance?.hasAttendance
                    ? "Cập nhật điểm danh"
                    : "Lưu điểm danh"}
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        <Card className="student-table-card">
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={filtered}
              rowKey="attendanceId"
              pagination={{
                total: filtered.length,
                pageSize: 20,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (t, r) => `${r[0]}-${r[1]} của ${t} sinh viên`,
                position: ["bottomRight"],
                pageSizeOptions: ["10", "20", "50", "100"],
              }}
              scroll={{ x: 1000 }}
              className="custom-table"
            />
          </Spin>
        </Card>
      </div>
    </>
  );
};

export default TeacherClassStudentList;
