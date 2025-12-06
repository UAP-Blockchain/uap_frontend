import React, { useEffect, useState, useRef } from "react";
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
import { getAttendanceManagementContract } from "../../../blockchain/attendance";
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
  const [savingOnChainId, setSavingOnChainId] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] = useState<
    Record<string, { isPresent: boolean; notes?: string }>
  >({});
  const [onChainTxs, setOnChainTxs] = useState<
    {
      attendanceId: string;
      txHash: string;
      statusText: string;
      createdAt: string;
      studentName: string;
    }[]
  >([]);
  const fetchedSlotIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
      const slotId = state.slotId;
    
      if (!slotId) {
      setSlotAttendance(null);
      setAttendanceData({});
      fetchedSlotIdRef.current = null;
      setLoading(false);
      return;
    }

    // Reset ref if slotId changed
    if (fetchedSlotIdRef.current !== slotId) {
      fetchedSlotIdRef.current = null;
    }

    // Prevent duplicate calls for the same slotId
    if (fetchedSlotIdRef.current === slotId || isFetchingRef.current) {
        return;
      }

    const fetchSlotAttendance = async () => {
      isFetchingRef.current = true;
      fetchedSlotIdRef.current = slotId;
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
        // Reset ref on error so it can retry
        fetchedSlotIdRef.current = null;
        // Chỉ hiển thị thông báo FE thuần, không dùng message từ BE
        const errorMessage =
          "Không thể tải dữ liệu điểm danh. Vui lòng thử lại.";
        api.error({
          message: "Lỗi tải dữ liệu",
          description: errorMessage,
          icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
          placement: "topRight",
        });
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    void fetchSlotAttendance();
  }, [state.slotId]);

  const handleMarkAllPresent = () => {
    if (!slotAttendance) {
      api.error({
        message: "Lỗi",
        description: "Không tìm thấy thông tin slot",
        icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
        placement: "topRight",
      });
      return;
    }

    const updatedData: Record<string, { isPresent: boolean; notes?: string }> =
      {};
      slotAttendance.studentAttendances.forEach((attendance) => {
        updatedData[attendance.studentId] = {
          isPresent: true,
          notes: attendanceData[attendance.studentId]?.notes,
        };
      });
      setAttendanceData(updatedData);
  };

  const handleMarkAllAbsent = () => {
    if (!slotAttendance) {
      api.error({
        message: "Lỗi",
        description: "Không tìm thấy thông tin slot",
        icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
        placement: "topRight",
      });
      return;
    }

    const updatedData: Record<string, { isPresent: boolean; notes?: string }> =
      {};
      slotAttendance.studentAttendances.forEach((attendance) => {
        updatedData[attendance.studentId] = {
          isPresent: false,
          notes: attendanceData[attendance.studentId]?.notes,
        };
      });
      setAttendanceData(updatedData);
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
      // Reset refs to allow fresh fetch
      fetchedSlotIdRef.current = null;
      isFetchingRef.current = false;
      
      try {
        const updatedData = await AttendanceServices.getSlotAttendance(slotId);
        
        // Update refs before setting state to prevent useEffect from triggering
        fetchedSlotIdRef.current = slotId;
        
        setSlotAttendance(updatedData);

        // Update attendance data
        const newAttendanceData: Record<
          string,
          { isPresent: boolean; notes?: string }
        > = {};
        updatedData.studentAttendances.forEach((attendance) => {
          newAttendanceData[attendance.studentId] = {
            isPresent: attendance.isPresent ?? false,
            notes: attendance.notes || undefined,
          };
        });
        setAttendanceData(newAttendanceData);
      } catch (refreshErr) {
        // If refresh fails, reset refs so it can retry
        fetchedSlotIdRef.current = null;
        console.error("Failed to refresh data:", refreshErr);
      }

      // Remain on the class list page after saving so user can continue working
    } catch (err: any) {
      // Lấy thông báo lỗi từ API response
      const errorMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Chưa đến ngày được phép điểm danh.";
      api.error({
        message: "Lỗi",
        description: errorMessage,
        icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
        placement: "topRight",
        duration: 5,
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
    {
      title: "On-chain",
      key: "onChain",
      width: 200,
      render: (_: unknown, record: StudentAttendanceDetailDto) => {
        const isPresent =
          attendanceData[record.studentId]?.isPresent ?? record.isPresent;

        return (
          <Space direction="vertical" size={4}>
            <Tag color={isPresent ? "green" : "red"}>
              {isPresent ? "Sẽ ghi có mặt" : "Sẽ ghi vắng"}
            </Tag>
            <Button
              size="small"
              loading={savingOnChainId === record.attendanceId}
              onClick={async () => {
                if (!slotAttendance) return;

                if (!record.walletAddress) {
                  api.error({
                    message: "Thiếu địa chỉ ví",
                    description:
                      "Sinh viên này chưa có địa chỉ ví, không thể ghi on-chain.",
                    icon: (
                      <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                    ),
                    placement: "topRight",
                  });
                  return;
                }

                try {
                  setSavingOnChainId(record.attendanceId);

                  const contract = await getAttendanceManagementContract();

                  const statusCode = isPresent ? 1 : 2; // map theo enum AttendanceStatus

                  const sessionDateUnix = Math.floor(
                    new Date(slotAttendance.date).getTime() / 1000
                  );

                  const classId = Number(
                    (slotAttendance as any).onChainClassId ??
                      slotAttendance.classId
                  );

                  if (!Number.isFinite(classId)) {
                    api.error({
                      message: "Thiếu classId on-chain",
                      description:
                        "Không tìm thấy mã lớp on-chain (onChainClassId). Vui lòng cấu hình backend.",
                      icon: (
                        <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                      ),
                      placement: "topRight",
                    });
                    setSavingOnChainId(null);
                    return;
                  }

                  const tx = await contract.markAttendance(
                    classId,
                    record.walletAddress,
                    sessionDateUnix,
                    statusCode,
                    attendanceData[record.studentId]?.notes || ""
                  );

                  const receipt = await tx.wait();

                  await AttendanceServices.saveAttendanceOnChain(
                    record.attendanceId,
                    {
                      transactionHash: receipt.hash,
                    }
                  );

                  setOnChainTxs((prev) => [
                    {
                      attendanceId: record.attendanceId,
                      txHash: receipt.hash,
                      statusText: isPresent ? "Có mặt" : "Vắng",
                      createdAt: new Date().toISOString(),
                      studentName: record.studentName,
                    },
                    ...prev,
                  ]);

                  api.success({
                    message: "Ghi on-chain thành công",
                    description: `Tx: ${receipt.hash}`,
                    icon: (
                      <CheckCircleOutlined style={{ color: "#52c41a" }} />
                    ),
                    placement: "topRight",
                    duration: 4,
                  });
                } catch (err) {
                  const errorMessage =
                    (err as { message?: string })?.message ||
                    "Không thể ghi on-chain cho bản ghi này";
                  api.error({
                    message: "Lỗi on-chain",
                    description: errorMessage,
                    icon: (
                      <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                    ),
                    placement: "topRight",
                  });
                } finally {
                  setSavingOnChainId(null);
                }
              }}
            >
              Ghi on-chain
            </Button>
          </Space>
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
                  disabled={!state.slotId || !slotAttendance}
                  className="mark-all-present-btn"
                  size="large"
                >
                  Tất cả có mặt
                </Button>
                <Button
                  onClick={handleMarkAllAbsent}
                  disabled={!state.slotId || !slotAttendance}
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
              rowKey="studentId"
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
        {onChainTxs.length > 0 && (
          <Card
            className="student-table-card"
            style={{ marginTop: 16 }}
            title="Lịch sử giao dịch on-chain trong buổi học này"
          >
            {onChainTxs.map((tx) => (
              <div
                key={`${tx.attendanceId}-${tx.txHash}`}
                style={{
                  padding: "4px 0",
                  fontSize: 13,
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <Text strong>
                  {tx.studentName} - {tx.statusText}
                </Text>{" "}
                <Text type="secondary">
                  • TX: <span style={{ wordBreak: "break-all" }}>{tx.txHash}</span>{" "}
                  • {dayjs(tx.createdAt).format("HH:mm:ss DD/MM/YYYY")}
                </Text>
              </div>
            ))}
          </Card>
        )}
      </div>
    </>
  );
};

export default TeacherClassStudentList;
