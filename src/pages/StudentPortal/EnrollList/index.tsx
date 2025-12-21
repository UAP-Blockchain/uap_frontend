import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  notification,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import { getUpcomingSemester } from "../../../services/student/semester.service";
import {
  getSubjectOfferingsBySubject,
  getSubjectOfferingsBySemester,
} from "../../../services/student/subjectOffering.service";
import {
  getClassesBySubjectAndSemester,
  getClassSlots,
  getClassRoster,
} from "../../../services/student/class.service";
import { createEnrollment } from "../../../services/student/enrollment.service";
import type { SemesterDto } from "../../../types/Semester";
import type { SubjectOffering } from "../../../types/SubjectOffering";
import type { ClassSummary } from "../../../types/Class";
import type { SlotDto } from "../../../types/Slot";
import "./EnrollList.scss";

const { Title, Text } = Typography;

interface ClassWithDetails extends ClassSummary {
  slots: SlotDto[];
  enrolledCount: number;
  scheduleText: string;
  isEnrolled?: boolean;
  enrollmentStatus?: "Pending" | "Approved" | "Rejected";
}

const EnrollList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [api, contextHolder] = notification.useNotification();

  const [subjectCode, setSubjectCode] = useState<string>("");
  const [subjectName, setSubjectName] = useState<string>("");
  const [semester, setSemester] = useState<SemesterDto | null>(null);
  const [classes, setClasses] = useState<ClassWithDetails[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get subject info from location state
        const state = location.state as {
          subjectId?: string;
          subjectCode?: string;
          subjectName?: string;
        };

        if (!state?.subjectId) {
          setError("Thông tin môn học không hợp lệ");
          setLoading(false);
          return;
        }

        setSubjectCode(state.subjectCode || "");
        setSubjectName(state.subjectName || "");

        // Get upcoming semester
        const upcomingSemester = await getUpcomingSemester();
        if (!upcomingSemester) {
          setError("Không tìm thấy học kỳ sắp tới");
          setLoading(false);
          return;
        }
        setSemester(upcomingSemester);

        // Get subject offerings
        let offerings: SubjectOffering[] = [];
        try {
          offerings = await getSubjectOfferingsBySubject(state.subjectId);
        } catch {
          // If 404, try to get by semester
          offerings = await getSubjectOfferingsBySemester(upcomingSemester.id);
        }

        // Find active offering for this subject and semester
        let offering = offerings.find(
          (o) =>
            o.subjectId === state.subjectId &&
            o.semesterId === upcomingSemester.id &&
            o.isActive
        );

        // Fallback: find any active offering for this subject
        if (!offering) {
          offering = offerings.find(
            (o) => o.subjectId === state.subjectId && o.isActive
          );
        }

        if (!offering) {
          setError("Môn học này hiện không có lớp học nào mở đăng ký");
          setLoading(false);
          return;
        }

        // Get classes
        const classList = await getClassesBySubjectAndSemester(
          state.subjectId,
          upcomingSemester.id
        );

        // Get details for each class
        const classesWithDetails = await Promise.all(
          classList.map(async (cls) => {
            const [slots, enrolledCount] = await Promise.all([
              getClassSlots(cls.id),
              getClassRoster(cls.id),
            ]);

            // Format schedule
            const scheduleText = formatSlotsToSchedule(slots);

            // Load enrollment status from localStorage
            const enrollmentKey = `enrollment_${cls.id}`;
            const savedEnrollment = localStorage.getItem(enrollmentKey);
            let enrollmentStatus:
              | "Pending"
              | "Approved"
              | "Rejected"
              | undefined;
            let isEnrolled = false;

            if (savedEnrollment) {
              try {
                const parsed = JSON.parse(savedEnrollment);
                if (parsed.status && parsed.timestamp) {
                  // Check if enrollment is still valid (not expired after 30 days)
                  const enrollmentDate = dayjs(parsed.timestamp);
                  const daysSinceEnrollment = dayjs().diff(
                    enrollmentDate,
                    "day"
                  );
                  if (daysSinceEnrollment < 30) {
                    enrollmentStatus = parsed.status;
                    isEnrolled = true;
                  } else {
                    // Remove expired enrollment
                    localStorage.removeItem(enrollmentKey);
                  }
                }
              } catch {
                // Invalid data, remove it
                localStorage.removeItem(enrollmentKey);
              }
            }

            return {
              ...cls,
              slots,
              enrolledCount,
              scheduleText,
              isEnrolled,
              enrollmentStatus,
            };
          })
        );

        setClasses(classesWithDetails);
      } catch (err: unknown) {
        const errorMessage =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ||
          (err as { message?: string })?.message ||
          "Có lỗi xảy ra khi tải dữ liệu";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [location.state]);

  /**
   * Lấy nhãn thứ tiếng Việt từ ngày
   */
  const getVietnameseDayLabel = (date: string) => {
    const dayIndex = dayjs(date).day(); // 0-6 (Sun-Sat)
    const labels = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];
    return {
      label: labels[dayIndex] ?? "",
      order: dayIndex === 0 ? 7 : dayIndex, // Cho Chủ nhật xuống cuối
    };
  };

  /**
   * Từ danh sách slot, rút ra pattern lặp theo tuần: "Thứ 3 - Slot 3", "Thứ 5 - Slot 3", ...
   */
  const getWeeklyPatterns = (
    slots: SlotDto[]
  ): { key: string; text: string; order: number }[] => {
    const map: Record<string, { text: string; order: number }> = {};

    slots.forEach((slot) => {
      if (!slot.date || !slot.timeSlotName) return;

      const { label: dayLabel, order } = getVietnameseDayLabel(slot.date);
      const slotName = slot.timeSlotName;
      const key = `${order}-${slotName}`;

      if (!map[key]) {
        map[key] = {
          text: `${dayLabel} - ${slotName}`,
          order,
        };
      }
    });

    return Object.entries(map)
      .map(([key, value]) => ({ key, text: value.text, order: value.order }))
      .sort((a, b) => a.order - b.order || a.text.localeCompare(b.text));
  };

  /**
   * Chuỗi tóm tắt lịch học: "Thứ 3 - Slot 3, Thứ 5 - Slot 3"
   */
  const formatSlotsToSchedule = (slots: SlotDto[]): string => {
    if (!slots || slots.length === 0) return "Chưa có lịch học";

    const patterns = getWeeklyPatterns(slots);
    if (!patterns.length) return "Chưa có lịch học";

    return patterns.map((p) => p.text).join(", ");
  };

  const handleRegister = async (classId: string) => {
    setRegistering(classId);
    try {
      const response = await createEnrollment({ classId });

      // Nếu backend trả về cảnh báo không blocking, hiển thị thêm
      if (response.warnings && response.warnings.length > 0) {
        api.info({
          message: "Lưu ý khi đăng ký lớp",
          description: response.warnings.join("; "),
          placement: "topRight",
          duration: 6,
        });
      }

      // Show success notification với message từ API
      api.success({
        message: "Đăng ký thành công!",
        description:
          response.message ||
          "Yêu cầu đăng ký của bạn đã được gửi và đang chờ được duyệt bởi quản trị viên.",
        placement: "topRight",
        duration: 5,
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      });

      // Save enrollment status to localStorage
      const enrollmentKey = `enrollment_${classId}`;
      localStorage.setItem(
        enrollmentKey,
        JSON.stringify({
          status: "Pending",
          timestamp: dayjs().toISOString(),
        })
      );

      // Update the class to show enrolled status
      const updatedClasses = classes.map((cls) => {
        if (cls.id === classId) {
          return {
            ...cls,
            isEnrolled: true,
            enrollmentStatus: "Pending" as const,
            enrolledCount: cls.enrolledCount + 1, // Increment count optimistically
          };
        }
        return cls;
      });
      setClasses(updatedClasses);

      // Refresh enrollment count from server after a short delay
      setTimeout(async () => {
        const refreshedClasses = await Promise.all(
          updatedClasses.map(async (cls) => {
            if (cls.id === classId) {
              const enrolledCount = await getClassRoster(cls.id);
              return { ...cls, enrolledCount };
            }
            return cls;
          })
        );
        setClasses(refreshedClasses);
      }, 1000);
    } catch (err: unknown) {
      const apiError = (
        err as {
          response?: { data?: { message?: string; errors?: string[] } };
          message?: string;
        }
      )?.response?.data;

      const errorMessage =
        (apiError?.errors && apiError.errors.length > 0
          ? apiError.errors.join("; ")
          : apiError?.message) ||
        (err as { message?: string })?.message ||
        "Không thể đăng ký lớp học. Vui lòng thử lại sau.";

      // Show error notification với message từ API
      api.error({
        message: "Đăng ký thất bại",
        description: errorMessage,
        placement: "topRight",
        duration: 5,
      });
    } finally {
      setRegistering(null);
    }
  };

  const handleBack = () => {
    const state = location.state as { from?: string };
    if (state?.from === "roadmap") {
      navigate("/student-portal/roadmap");
    } else {
      navigate("/student-portal/course-registration");
    }
  };

  if (loading) {
    return (
      <div className="enroll-list-page">
        <div className="loading-container">
          <Spin size="large" />
          <Text type="secondary" style={{ marginTop: 16, display: "block" }}>
            Đang tải danh sách lớp học...
          </Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="enroll-list-page">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          style={{ marginBottom: 16 }}
        >
          Quay lại
        </Button>
        <Alert
          type="error"
          message="Không thể tải dữ liệu"
          description={error}
          showIcon
        />
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="enroll-list-page">
        <div className="enroll-header">
          <div className="header-content">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              style={{
                position: "absolute",
                top: 24,
                left: 24,
                zIndex: 10,
                background: "rgba(255, 255, 255, 0.2)",
                borderColor: "rgba(255, 255, 255, 0.3)",
                color: "#ffffff",
              }}
            >
              Quay lại
            </Button>
            <div className="header-title-section">
              <Text className="header-eyebrow">ĐĂNG KÝ LỚP HỌC</Text>
              <Title level={2} style={{ margin: 0, color: "#ffffff" }}>
                {subjectCode} - {subjectName}
              </Title>
              {semester && (
                <Text className="header-description">
                  Học kỳ: {semester.name} (
                  {dayjs(semester.startDate).format("DD/MM/YYYY")} -{" "}
                  {dayjs(semester.endDate).format("DD/MM/YYYY")})
                </Text>
              )}
            </div>
          </div>
        </div>

        {classes.length === 0 ? (
          <Card className="empty-card">
            <Empty
              description={
                <Text type="secondary">
                  Hiện không có lớp học nào cho môn học này trong học kỳ sắp
                  tới.
                </Text>
              }
            />
          </Card>
        ) : (
          <div className="classes-container">
            {classes.map((cls) => {
              const isFull = cls.maxEnrollment
                ? cls.enrolledCount >= cls.maxEnrollment
                : false;

              return (
                  <Card className="class-card" key={cls.id}>
                    <Row gutter={[24, 24]}>
                      <Col xs={24} lg={16}>
                        <Space
                          direction="vertical"
                          size={16}
                          style={{ width: "100%" }}
                        >
                          <div>
                            <Space
                              size={12}
                              align="center"
                              style={{ marginBottom: 8 }}
                            >
                              <Text
                                strong
                                style={{ fontSize: "20px", color: "#1a94fc" }}
                              >
                                {cls.classCode}
                              </Text>
                              <Tag
                                color="blue"
                                style={{
                                  fontSize: "13px",
                                  padding: "4px 12px",
                                }}
                              >
                                {cls.credits} tín chỉ
                              </Tag>
                            </Space>
                          </div>

                          <Row gutter={[16, 16]}>
                            <Col xs={24} sm={8}>
                              <div className="info-row">
                                <UserOutlined
                                  style={{ color: "#1a94fc", fontSize: "16px" }}
                                />
                                <div>
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: "13px" }}
                                  >
                                    Giảng viên
                                  </Text>
                                  <div>
                                    <Text strong>{cls.teacherName}</Text>
                                    {cls.teacherCode && (
                                      <Text
                                        type="secondary"
                                        style={{ marginLeft: 8 }}
                                      >
                                        ({cls.teacherCode})
                                      </Text>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Col>

                            <Col xs={24} sm={8}>
                              <div className="info-row">
                                <CalendarOutlined
                                  style={{ color: "#1a94fc", fontSize: "16px" }}
                                />
                                <div>
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: "13px" }}
                                  >
                                    Lịch học
                                  </Text>
                                  <div>
                                    <Text>
                                      {cls.scheduleText || "Chưa có lịch học"}
                                    </Text>
                                  </div>
                                </div>
                              </div>
                            </Col>

                            {cls.slots.length > 0 && (
                              <Col xs={24} sm={8}>
                                <div className="info-row">
                                  <ClockCircleOutlined
                                    style={{ color: "#1a94fc", fontSize: "16px" }}
                                  />
                                  <div>
                                    <Text
                                      type="secondary"
                                      style={{ fontSize: "13px" }}
                                    >
                                      Số ca học
                                    </Text>
                                    <div>
                                      <Text style={{ fontSize: "13px" }}>
                                        {cls.slots.length} Slot
                                      </Text>
                                    </div>
                                  </div>
                                </div>
                              </Col>
                            )}
                          </Row>
                        </Space>
                      </Col>

                      <Col xs={24} lg={8}>
                        <Space
                          direction="vertical"
                          size={16}
                          style={{ width: "100%" }}
                        >
                          {cls.isEnrolled ? (
                            <Button
                              type="default"
                              size="large"
                              block
                              icon={<CheckCircleOutlined />}
                              disabled
                              style={{
                                background:
                                  cls.enrollmentStatus === "Approved"
                                    ? "linear-gradient(135deg, #10b981, #059669)"
                                    : cls.enrollmentStatus === "Rejected"
                                    ? "linear-gradient(135deg, #ef4444, #dc2626)"
                                    : "linear-gradient(135deg, #f59e0b, #d97706)",
                                border: "none",
                                borderRadius: "12px",
                                height: "48px",
                                fontWeight: 600,
                                fontSize: "16px",
                                color: "#ffffff",
                                cursor: "not-allowed",
                              }}
                            >
                              {cls.enrollmentStatus === "Approved"
                                ? "Đã được duyệt"
                                : cls.enrollmentStatus === "Rejected"
                                ? "Đã bị từ chối"
                                : "Đang chờ duyệt"}
                            </Button>
                          ) : (
                            <Button
                              type="primary"
                              size="large"
                              block
                              icon={<CheckCircleOutlined />}
                              loading={registering === cls.id}
                              disabled={isFull || registering !== null}
                              onClick={() => handleRegister(cls.id)}
                              style={{
                                background: isFull
                                  ? "#94a3b8"
                                  : "linear-gradient(135deg, #1a94fc, #0ea5e9)",
                                border: "none",
                                borderRadius: "12px",
                                height: "48px",
                                fontWeight: 600,
                                fontSize: "16px",
                                boxShadow: isFull
                                  ? "none"
                                  : "0 4px 12px rgba(26, 148, 252, 0.3)",
                              }}
                            >
                              {registering === cls.id
                                ? "Đang đăng ký..."
                                : isFull
                                ? "Lớp đã đầy"
                                : "Đăng ký lớp này"}
                            </Button>
                          )}
                        </Space>
                      </Col>
                    </Row>
                  </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default EnrollList;
