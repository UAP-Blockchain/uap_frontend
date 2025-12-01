import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import StudentServices from "../../../services/student/api.service";
import { getAllTimeSlots } from "../../../services/admin/timeSlots/api";
import type {
  WeeklyScheduleDto,
  ScheduleItemDto,
} from "../../../types/Schedule";
import type { TimeSlotDto } from "../../../types/TimeSlot";
import "./WeeklyTimetable.scss";

dayjs.extend(weekOfYear);

const { Title, Text } = Typography;
const { Option } = Select;

type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

interface TimetableSlot {
  slotIndex: number;
  label: string;
  time?: string;
  monday?: ClassInfo | ClassInfo[];
  tuesday?: ClassInfo | ClassInfo[];
  wednesday?: ClassInfo | ClassInfo[];
  thursday?: ClassInfo | ClassInfo[];
  friday?: ClassInfo | ClassInfo[];
  saturday?: ClassInfo | ClassInfo[];
  sunday?: ClassInfo | ClassInfo[];
}

interface ClassInfo {
  courseCode: string;
  courseName: string;
  instructor?: string;
  location?: string;
  attendance?: "attended" | "absent" | "not_yet";
  date: string;
  classId?: string;
  slotId?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
  rawSlot?: ScheduleItemDto;
}

const dayMappings: Record<
  string,
  { key: DayKey; label: string; shortLabel: string }
> = {
  Monday: { key: "monday", label: "Thứ 2", shortLabel: "T2" },
  Tuesday: { key: "tuesday", label: "Thứ 3", shortLabel: "T3" },
  Wednesday: { key: "wednesday", label: "Thứ 4", shortLabel: "T4" },
  Thursday: { key: "thursday", label: "Thứ 5", shortLabel: "T5" },
  Friday: { key: "friday", label: "Thứ 6", shortLabel: "T6" },
  Saturday: { key: "saturday", label: "Thứ 7", shortLabel: "T7" },
  Sunday: { key: "sunday", label: "Chủ nhật", shortLabel: "CN" },
};

const WeeklyTimetable: React.FC = () => {
  const navigate = useNavigate();
  const [selectedWeek, setSelectedWeek] = useState(dayjs());
  const [weeklySchedule, setWeeklySchedule] =
    useState<WeeklyScheduleDto | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlotDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMondayOfWeek = useCallback((date: dayjs.Dayjs) => {
    const day = date.day();
    const diff = day === 0 ? -6 : 1 - day;
    return date.add(diff, "day").startOf("day");
  }, []);

  const formatTimeRange = useCallback((start?: string, end?: string) => {
    if (!start || !end) return "—";

    // Handle TimeSpan format from backend (HH:mm:ss) or ISO time string
    try {
      let startTime: string;
      let endTime: string;

      // Parse start time
      if (start.includes("T")) {
        // ISO datetime string
        startTime = dayjs(start).format("HH:mm");
      } else if (start.includes(":")) {
        // TimeSpan format (HH:mm:ss or HH:mm)
        const parts = start.split(":");
        startTime = `${parts[0]}:${parts[1]}`;
      } else {
        startTime = start;
      }

      // Parse end time
      if (end.includes("T")) {
        // ISO datetime string
        endTime = dayjs(end).format("HH:mm");
      } else if (end.includes(":")) {
        // TimeSpan format (HH:mm:ss or HH:mm)
        const parts = end.split(":");
        endTime = `${parts[0]}:${parts[1]}`;
      } else {
        endTime = end;
      }

      return `${startTime} - ${endTime}`;
    } catch (error) {
      console.warn("Error formatting time range:", error, { start, end });
      return "—";
    }
  }, []);

  const mapAttendance = useCallback(
    (slot: ScheduleItemDto): ClassInfo["attendance"] => {
      if (slot.isPresent === true) return "attended";
      if (slot.isPresent === false) return "absent";
      if (slot.hasAttendance) return "not_yet";
      return undefined;
    },
    []
  );

  const convertSlotToClassInfo = useCallback(
    (slot: ScheduleItemDto): ClassInfo => {
      // Ensure date is valid - if slot.date is invalid, use day from dayData
      let validDate = slot.date;
      if (!validDate || !dayjs(validDate).isValid()) {
        // Try to construct date from dayData if available
        validDate = dayjs().toISOString();
      }

      return {
        courseCode: slot.subjectCode || slot.classCode,
        courseName: slot.subjectName || slot.classCode,
        // Ưu tiên hiển thị tên giảng viên rõ ràng
        instructor: slot.teacherName || slot.teacherCode || undefined,
        location: slot.notes || slot.classCode,
        attendance: mapAttendance(slot),
        date: validDate,
        classId: slot.classId,
        slotId: slot.slotId,
        status: slot.status,
        startTime: slot.startTime,
        endTime: slot.endTime,
        rawSlot: slot,
      };
    },
    [mapAttendance]
  );

  const fetchWeeklySchedule = useCallback(
    async (week: dayjs.Dayjs) => {
      const monday = getMondayOfWeek(week);
      setIsLoading(true);
      setError(null);
      try {
        const data = await StudentServices.getMyWeeklySchedule(
          monday.toISOString()
        );
        setWeeklySchedule(data);
      } catch (err) {
        const message =
          (err as { message?: string })?.message ||
          "Không thể tải dữ liệu thời khóa biểu.";
        setError(message);
        setWeeklySchedule(null);
      } finally {
        setIsLoading(false);
      }
    },
    [getMondayOfWeek]
  );

  useEffect(() => {
    fetchWeeklySchedule(selectedWeek);
  }, [fetchWeeklySchedule, selectedWeek]);

  // Load full list of time slots so table luôn hiển thị đủ các ca học
  useEffect(() => {
    const loadTimeSlots = async () => {
      try {
        const slots = await getAllTimeSlots();
        // Sắp xếp theo startTime để hiển thị đúng thứ tự
        const sorted = [...slots].sort((a, b) =>
          a.startTime.localeCompare(b.startTime)
        );
        setTimeSlots(sorted);
      } catch {
        // Nếu lỗi vẫn fallback dùng data từ schedule
        setTimeSlots([]);
      }
    };

    void loadTimeSlots();
  }, []);

  const getAttendanceTag = (attendance?: string) => {
    switch (attendance) {
      case "attended":
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Đã điểm danh
          </Tag>
        );
      case "absent":
        return (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            Chưa điểm danh
          </Tag>
        );
      case "not_yet":
        return (
          <Tag color="warning" icon={<ExclamationCircleOutlined />}>
            Chưa có
          </Tag>
        );
      default:
        return null;
    }
  };

  const getActivityId = (classInfo: ClassInfo, dayKey: string) => {
    if (classInfo.slotId) return classInfo.slotId;
    if (classInfo.classId) return classInfo.classId;
    return `${classInfo.courseCode}_${dayKey}`;
  };

  const renderClassCell = useCallback(
    (classInfo?: ClassInfo | ClassInfo[], dayKey?: string) => {
      if (!classInfo) {
        return <div className="empty-slot">-</div>;
      }

      // Handle array of classes (multiple classes in same time slot)
      const classes = Array.isArray(classInfo) ? classInfo : [classInfo];

      return (
        <div className="class-slot-container">
          {classes.map((info, index) => {
            const handleViewDetails = () => {
              const activityId = getActivityId(info, dayKey || "tue");
              navigate(`/student-portal/activity/${activityId}`, {
                state: { slot: info.rawSlot },
              });
            };

            return (
              <div
                key={index}
                className="class-slot"
                onClick={handleViewDetails}
                style={{
                  cursor: "pointer",
                  marginBottom: index < classes.length - 1 ? 8 : 0,
                }}
              >
                <div className="course-code">
                  <Text strong>{info.courseCode}</Text>
                  <Tooltip title="Xem chi tiết">
                    <Button
                      type="link"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails();
                      }}
                    >
                      Xem tài liệu
                    </Button>
                  </Tooltip>
                </div>
                <div className="course-info">
                  <Text style={{ fontSize: 12 }}>{info.courseName}</Text>
                </div>
                <div className="attendance-status">
                  {getAttendanceTag(info.attendance)}
                </div>
                <div className="time-info">
                  <span className="time-pill">
                    {formatTimeRange(info.startTime, info.endTime)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      );
    },
    [navigate, formatTimeRange]
  );

  const timetableData = useMemo(() => {
    if (!weeklySchedule) return [];

    // Nếu có danh sách TimeSlots từ backend thì dùng làm khung chính
    const baseSlots: TimetableSlot[] =
      timeSlots.length > 0
        ? timeSlots.map((ts, index) => ({
            slotIndex: index + 1,
            label: ts.name || `Slot ${index + 1}`,
            time: formatTimeRange(ts.startTime, ts.endTime),
          }))
        : [];

    const slotMap = new Map<string, TimetableSlot>();

    // Khởi tạo map từ baseSlots để luôn có đủ các ca
    baseSlots.forEach((s) => {
      slotMap.set(s.label, { ...s });
    });

    weeklySchedule.days.forEach((day) => {
      const dayMeta = dayMappings[day.dayOfWeek];
      if (!dayMeta) return;

      const dayDate =
        day.date && dayjs(day.date).isValid()
          ? day.date
          : dayjs().toISOString();

      day.slots.forEach((slot) => {
        const slotDate =
          slot.date && dayjs(slot.date).isValid() ? slot.date : dayDate;

        // Tìm dòng theo TimeSlotName nếu có, nếu không fallback label tự sinh
        const labelKey = slot.timeSlotName || `Slot-${slot.timeSlotId}`;

        if (!slotMap.has(labelKey)) {
          slotMap.set(labelKey, {
            slotIndex: slotMap.size + 1,
            label: labelKey,
            time: formatTimeRange(slot.startTime, slot.endTime),
          });
        }

        const row = slotMap.get(labelKey);
        if (!row) return;

        const slotWithDate = { ...slot, date: slotDate };
        const classInfo = convertSlotToClassInfo(slotWithDate);
        const existing = row[dayMeta.key];

        if (existing) {
          if (Array.isArray(existing)) {
            existing.push(classInfo);
          } else {
            row[dayMeta.key] = [existing, classInfo];
          }
        } else {
          row[dayMeta.key] = classInfo;
        }
      });
    });

    const rows = Array.from(slotMap.values()).sort(
      (a, b) => a.slotIndex - b.slotIndex
    );

    return rows;
  }, [weeklySchedule, timeSlots, convertSlotToClassInfo, formatTimeRange]);

  const columns: ColumnsType<TimetableSlot> = useMemo(() => {
    const base: ColumnsType<TimetableSlot> = [
      {
        title: "Ca học",
        dataIndex: "slotIndex",
        key: "slotIndex",
        width: 120,
        render: (_: number, record: TimetableSlot) => (
          <div className="time-slot-header">
            <div className="slot-number">{record.label}</div>
          </div>
        ),
      },
    ];

    Object.keys(dayMappings).forEach((dayName) => {
      const meta = dayMappings[dayName];
      const dayData = weeklySchedule?.days.find((d) => d.dayOfWeek === dayName);

      base.push({
        title: (
          <div className="day-header">
            <CalendarOutlined />
            <span>{meta.shortLabel}</span>
            <div className="date-number">
              {dayData && dayData.date && dayjs(dayData.date).isValid()
                ? dayjs(dayData.date).format("DD/MM")
                : "--/--"}
            </div>
          </div>
        ),
        dataIndex: meta.key,
        key: meta.key,
        width: 130,
        render: (classInfo: ClassInfo | ClassInfo[]) =>
          renderClassCell(classInfo, meta.shortLabel.toLowerCase()),
      });
    });

    return base;
  }, [weeklySchedule, renderClassCell]);

  const handleWeekChange = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setSelectedWeek((prev) => prev.subtract(1, "week"));
    } else {
      setSelectedWeek((prev) => prev.add(1, "week"));
    }
  };

  return (
    <div className="weekly-timetable">
      {/* Page Header */}
      <div className="timetable-header">
        {/* Week Navigation */}
        <Card className="week-nav-card">
          <Row align="middle" justify="space-between">
            <Col>
              <Space>
                <Button type="primary" onClick={() => handleWeekChange("prev")}>
                  ← Tuần trước
                </Button>
                <Button onClick={() => handleWeekChange("next")}>
                  Tuần sau →
                </Button>
              </Space>
            </Col>
            <Col>
              <div className="week-info">
                <Title level={4} style={{ margin: 0 }}>
                  {(() => {
                    const start = getMondayOfWeek(selectedWeek);
                    const end = start.add(6, "day");
                    return `Từ ${start.format("DD/MM")} đến ${end.format(
                      "DD/MM/YYYY"
                    )}`;
                  })()}
                </Title>
                <Text type="secondary">
                  Tổng số ca: {weeklySchedule?.totalSlots ?? 0}
                </Text>
              </div>
            </Col>
            <Col>
              <div className="date-controls">
                <Space size="middle">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => setSelectedWeek(dayjs())}
                    className="current-week-btn"
                  >
                    Tuần hiện tại
                  </Button>
                  <div className="date-select-group">
                    <Select
                      value={selectedWeek.format("YYYY")}
                      className="year-select"
                      suffixIcon={null}
                      onChange={(year: string) =>
                        setSelectedWeek((prev) => prev.year(Number(year)))
                      }
                    >
                      <Option value="2024">2024</Option>
                      <Option value="2025">2025</Option>
                    </Select>
                    <DatePicker.WeekPicker
                      value={selectedWeek}
                      onChange={(date: dayjs.Dayjs | null) =>
                        date && setSelectedWeek(date)
                      }
                      className="week-picker"
                      format="YYYY-wo"
                      placeholder="Chọn tuần"
                      allowClear={false}
                    />
                  </div>
                </Space>
              </div>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Timetable */}
      <Card className="timetable-card">
        {error && (
          <Alert
            type="error"
            message="Không thể tải thời khóa biểu"
            description={error}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        <Spin spinning={isLoading}>
          <Table
            columns={columns}
            dataSource={timetableData}
            rowKey={(record) => `${record.label}-${record.time}`}
            pagination={false}
            bordered
            size="middle"
            className="timetable-table"
            scroll={{ x: true }}
            locale={{ emptyText: null }}
          />
        </Spin>
      </Card>

      {/* Legend */}
      <Card style={{ marginTop: 24 }}>
        <Row gutter={[16, 8]} align="middle">
          <Col>
            <Text strong>Chú thích:</Text>
          </Col>
          <Col>
            <Space>
              <Badge
                color="#52c41a"
                text="Đã tham gia - Sinh viên đã tham gia lớp học này"
              />
              <Badge color="#ff4d4f" text="Vắng mặt - Sinh viên đã vắng mặt" />
              <Badge color="#faad14" text="Chưa có - Lớp học chưa bắt đầu" />
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default WeeklyTimetable;
