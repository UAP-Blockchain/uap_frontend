import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
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
  message,
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
import TeacherServices from "../../../services/teacher/api.service";
import { getAllTimeSlots } from "../../../services/admin/timeSlots/api";
import type {
  ScheduleItemDto,
  WeeklyScheduleDto,
} from "../../../types/Schedule";
import type { TimeSlotDto } from "../../../types/TimeSlot";
import "../../StudentPortal/WeeklyTimetable/WeeklyTimetable.scss";
import "./index.scss";

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

const TeacherSchedule: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Khôi phục selectedWeek từ URL params hoặc location.state (chỉ một lần khi mount)
  const getInitialWeek = () => {
    // Ưu tiên từ location.state (khi quay lại từ classList)
    if (
      location.state &&
      (location.state as { selectedWeek?: string }).selectedWeek
    ) {
      const weekFromState = dayjs(
        (location.state as { selectedWeek: string }).selectedWeek
      );
      if (weekFromState.isValid()) {
        return weekFromState;
      }
    }
    // Sau đó từ URL params
    const weekParam = searchParams.get("week");
    if (weekParam) {
      const weekFromUrl = dayjs(weekParam);
      if (weekFromUrl.isValid()) {
        return weekFromUrl;
      }
    }
    // Mặc định là tuần hiện tại
    return dayjs();
  };

  const [selectedWeek, setSelectedWeek] = useState(getInitialWeek);
  const [weeklySchedule, setWeeklySchedule] =
    useState<WeeklyScheduleDto | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlotDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Khôi phục selectedWeek khi quay lại từ classList (chỉ chạy khi location.state thay đổi)
  useEffect(() => {
    if (
      location.state &&
      (location.state as { selectedWeek?: string }).selectedWeek
    ) {
      const weekFromState = dayjs(
        (location.state as { selectedWeek: string }).selectedWeek
      );
      if (weekFromState.isValid()) {
        const weekStr = weekFromState.format("YYYY-MM-DD");
        const currentWeekStr = selectedWeek.format("YYYY-MM-DD");
        if (weekStr !== currentWeekStr) {
          setSelectedWeek(weekFromState);
        }
      }
      // Clear location.state sau khi đã sử dụng để tránh restore lại khi refresh
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // Cập nhật URL params khi selectedWeek thay đổi (nhưng không tạo vòng lặp)
  useEffect(() => {
    const weekParam = selectedWeek.format("YYYY-MM-DD");
    const currentWeekParam = searchParams.get("week");
    if (currentWeekParam !== weekParam) {
      setSearchParams({ week: weekParam }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWeek]);

  const getMondayOfWeek = useCallback((date: dayjs.Dayjs) => {
    const day = date.day();
    const diff = day === 0 ? -6 : 1 - day;
    return date.add(diff, "day").startOf("day");
  }, []);

  const formatTimeRange = useCallback((start?: string, end?: string) => {
    if (!start || !end) return "—";

    const parse = (value: string) => {
      if (value.includes("T")) return dayjs(value).format("HH:mm");
      if (value.includes(":")) {
        const parts = value.split(":");
        return `${parts[0]}:${parts[1]}`;
      }
      return value;
    };

    return `${parse(start)} - ${parse(end)}`;
  }, []);

  const mapAttendance = useCallback(
    (slot: ScheduleItemDto): ClassInfo["attendance"] => {
      // Logic giống student: dựa trên hasAttendance
      // hasAttendance: true → đã điểm danh (có thể có isPresent = true/false/null)
      // hasAttendance: false → chưa điểm danh
      if (slot.hasAttendance === true) return "attended";
      if (slot.hasAttendance === false) return "absent";
      return undefined;
    },
    []
  );

  const convertSlotToClassInfo = useCallback(
    (slot: ScheduleItemDto, fallbackDate: string): ClassInfo => {
      const validDate =
        slot.date && dayjs(slot.date).isValid() ? slot.date : fallbackDate;

      return {
        courseCode: slot.subjectCode || slot.classCode,
        courseName: slot.subjectName || slot.classCode,
        instructor: slot.teacherName,
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
        const data = await TeacherServices.getMyWeeklySchedule(
          monday.format("YYYY-MM-DD")
        );
        setWeeklySchedule(data);
      } catch (err) {
        const message =
          (err as { message?: string })?.message ||
          "Không thể tải lịch giảng dạy.";
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

  const getStatusTag = (attendance?: string) => {
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
      default:
        return null;
    }
  };

  const handleOpenAttendanceModal = useCallback(
    (info: ClassInfo) => {
      if (!info.classId || !info.slotId) {
        message.warning("Không tìm thấy thông tin lớp học hoặc slot");
        return;
      }

      // Navigate to class list page with slot info
      navigate(`/teacher/class-list/${info.classId}`, {
        state: {
          slot: info.rawSlot,
          slotId: info.slotId,
          classId: info.classId,
          courseCode: info.courseCode,
          courseName: info.courseName,
          date: info.date,
          startTime: info.startTime,
          endTime: info.endTime,
          selectedWeek: selectedWeek.format("YYYY-MM-DD"), // Lưu tuần hiện tại
        },
      });
    },
    [navigate, selectedWeek]
  );

  const handleNavigateClass = useCallback(
    (info: ClassInfo, dayKey: string) => {
      const targetId = info.classId || info.courseCode || dayKey;
      navigate(`/teacher/class-list/${targetId}`, {
        state: { 
          slot: info.rawSlot,
          selectedWeek: selectedWeek.format("YYYY-MM-DD"), // Lưu tuần hiện tại
        },
      });
    },
    [navigate, selectedWeek]
  );

  const renderClassCell = useCallback(
    (classInfo?: ClassInfo | ClassInfo[], dayKey?: string) => {
      if (!classInfo) {
        return <div className="empty-slot">-</div>;
      }

      const classes = Array.isArray(classInfo) ? classInfo : [classInfo];

      return (
        <div className="class-slot-container">
          {classes.map((info, index) => (
            <div
              key={`${info.slotId || info.classId}-${index}`}
              className="class-slot"
              onClick={() => handleOpenAttendanceModal(info)}
              style={{
                cursor: "pointer",
                marginBottom: index < classes.length - 1 ? 8 : 0,
              }}
            >
              <div className="course-code">
                <Text strong>{info.courseCode}</Text>
                <Tooltip title="Xem danh sách lớp">
                  <Button
                    type="link"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigateClass(info, dayKey || "t2");
                    }}
                  >
                    Chi tiết lớp
                  </Button>
                </Tooltip>
              </div>
              <div className="course-info">
                <Text style={{ fontSize: 12 }}>{info.courseName}</Text>
              </div>
              <div className="attendance-status">
                {getStatusTag(info.attendance)}
              </div>
              <div className="time-info">
                <span className="time-pill">
                  {formatTimeRange(info.startTime, info.endTime)}
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    },
    [handleNavigateClass, handleOpenAttendanceModal]
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
        const classInfo = convertSlotToClassInfo(slotWithDate, dayDate);
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
    setSelectedWeek((prev) =>
      direction === "prev" ? prev.subtract(1, "week") : prev.add(1, "week")
    );
  };

  return (
    <div className="weekly-timetable teacher-view">
      <div className="timetable-header">
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

      <Card className="timetable-card">
        {error && (
          <Alert
            type="error"
            message="Không thể tải lịch giảng dạy"
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

      <Card style={{ marginTop: 24 }}>
        <Row gutter={[16, 8]} align="middle">
          <Col>
            <Text strong>Chú thích:</Text>
          </Col>
          <Col>
            <Space>
              <Tag color="success" icon={<CheckCircleOutlined />}>
                Đã điểm danh
              </Tag>
              <Tag color="error" icon={<CloseCircleOutlined />}>
                Chưa điểm danh
              </Tag>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default TeacherSchedule;
