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
  Space,
  Spin,
  Table,
  Tooltip,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CalendarOutlined,
  ReloadOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import TeacherServices from "../../../services/teacher/api.service";
import type {
  ScheduleItemDto,
  WeeklyScheduleDto,
} from "../../../types/Schedule";
import "../../StudentPortal/WeeklyTimetable/WeeklyTimetable.scss";
import "./index.scss";

dayjs.extend(weekOfYear);

const { Title, Text } = Typography;
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
  time: string;
  label: string;
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

const DEFAULT_TIME_SLOTS: TimetableSlot[] = [
  { slotIndex: 1, time: "07:30 - 09:20", label: "Ca 1" },
  { slotIndex: 2, time: "09:30 - 11:20", label: "Ca 2" },
  { slotIndex: 3, time: "12:30 - 14:20", label: "Ca 3" },
  { slotIndex: 4, time: "14:30 - 16:20", label: "Ca 4" },
];

const attendanceStatusText: Record<string, string> = {
  attended: "Đã dạy",
  absent: "Vắng",
  not_yet: "Sắp diễn ra",
};

const TeacherSchedule: React.FC = () => {
  const navigate = useNavigate();
  const [selectedWeek, setSelectedWeek] = useState(dayjs());
  const [weeklySchedule, setWeeklySchedule] =
    useState<WeeklyScheduleDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      if (slot.status?.toLowerCase() === "completed") return "attended";
      if (slot.status?.toLowerCase() === "cancelled") return "absent";

      if (slot.isPresent === true) return "attended";
      if (slot.isPresent === false) return "absent";
      if (slot.hasAttendance) return "not_yet";
      return "not_yet";
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
          monday.toISOString()
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
        },
      });
    },
    [navigate]
  );

  const handleNavigateClass = useCallback(
    (info: ClassInfo, dayKey: string) => {
      const targetId = info.classId || info.courseCode || dayKey;
      navigate(`/teacher/class-list/${targetId}`, {
        state: { slot: info.rawSlot },
      });
    },
    [navigate]
  );

  const renderClassCell = useCallback(
    (classInfo?: ClassInfo | ClassInfo[], dayKey?: string) => {
      if (!classInfo) {
        return <div className="empty-slot">-</div>;
      }

      const classes = Array.isArray(classInfo) ? classInfo : [classInfo];

      return (
        <div className="class-slot-container">
          {classes.map((info, index) => {
            const status = info.attendance || "not_yet";
            const dateLabel =
              info.date && dayjs(info.date).isValid()
                ? dayjs(info.date).format("DD/MM/YYYY")
                : "—";
            const timeLabel = formatTimeRange(info.startTime, info.endTime);

            return (
              <div
                key={`${info.slotId || info.classId}-${index}`}
                className="class-slot"
                data-status={status}
                onClick={() => handleOpenAttendanceModal(info)}
                style={{
                  cursor: "pointer",
                  marginBottom: index < classes.length - 1 ? 8 : 0,
                }}
              >
                <div className="class-slot__header">
                  <span className="code">{info.courseCode}</span>
                  <span className={`status-chip status-${status}`}>
                    {attendanceStatusText[status] || "Lớp học"}
                  </span>
                </div>
                <div className="class-slot__name">{info.courseName}</div>
                <div className="class-slot__meta">
                  {info.location && (
                    <span className="meta-tag">{info.location}</span>
                  )}
                  <span className="meta-tag">{timeLabel}</span>
                </div>
                <div className="class-slot__footer">
                  <span>{dateLabel}</span>
                  <Tooltip title="Xem chi tiết lớp">
                    <Button
                      type="link"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateClass(info, dayKey || "t2");
                      }}
                    >
                      Chi tiết
                    </Button>
                  </Tooltip>
                </div>
              </div>
            );
          })}
        </div>
      );
    },
    [formatTimeRange, handleNavigateClass, handleOpenAttendanceModal]
  );

  const timetableData = useMemo(() => {
    if (!weeklySchedule) return DEFAULT_TIME_SLOTS;

    const slotMap = new Map<string, TimetableSlot>();

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
        const timeSlotKey = slot.timeSlotId || slot.slotId;
        const startTime = slot.startTime || "00:00:00";
        const key = `${timeSlotKey}-${startTime}`;

        if (!slotMap.has(key)) {
          slotMap.set(key, {
            slotIndex: slotMap.size + 1,
            time: formatTimeRange(slot.startTime, slot.endTime),
            label: slot.timeSlotName || `Ca ${slotMap.size + 1}`,
          });
        }

        const row = slotMap.get(key);
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

    const rows = Array.from(slotMap.values()).sort((a, b) => {
      const timeA = a.time.split(" - ")[0] || "00:00";
      const timeB = b.time.split(" - ")[0] || "00:00";
      return timeA.localeCompare(timeB);
    });

    return rows.length > 0 ? rows : DEFAULT_TIME_SLOTS;
  }, [weeklySchedule, convertSlotToClassInfo, formatTimeRange]);

  const summaryStats = useMemo(() => {
    const total = weeklySchedule?.totalSlots ?? 0;
    const slots = weeklySchedule
      ? weeklySchedule.days.flatMap((day) => day.slots)
      : [];

    const completed = slots.filter((slot) => {
      const status = slot.status?.toLowerCase();
      if (status === "completed") return true;
      if (slot.isPresent === true) return true;
      return false;
    }).length;

    const cancelled = slots.filter(
      (slot) => slot.status?.toLowerCase() === "cancelled"
    ).length;

    const upcoming = Math.max(total - completed - cancelled, 0);
    const completedPercent =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return [
      {
        label: "Tổng ca",
        value: total,
        subtext: "Trong tuần này",
        accent: "primary",
      },
      {
        label: "Đã dạy",
        value: completed,
        subtext: `${completedPercent}% hoàn thành`,
        accent: "success",
      },
      {
        label: "Sắp diễn ra",
        value: upcoming,
        subtext: "Cần chuẩn bị",
        accent: "warning",
      },
      {
        label: "Hủy/Vắng",
        value: cancelled,
        subtext: "Kiểm tra lại lịch",
        accent: "danger",
      },
    ];
  }, [weeklySchedule]);

  const columns: ColumnsType<TimetableSlot> = useMemo(() => {
    const base: ColumnsType<TimetableSlot> = [
      {
        title: "Ca học",
        dataIndex: "slotIndex",
        key: "slotIndex",
        width: 130,
        render: (_: number, record: TimetableSlot) => (
          <div className="time-slot-header">
            <div className="slot-number">{record.label}</div>
            <div className="slot-time">{record.time}</div>
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

  const formattedWeekRange =
    weeklySchedule?.weekLabel ||
    `${getMondayOfWeek(selectedWeek).format("DD/MM")} - ${getMondayOfWeek(
      selectedWeek
    )
      .add(6, "day")
      .format("DD/MM/YYYY")}`;

  const handleWeekChange = (direction: "prev" | "next") => {
    setSelectedWeek((prev) =>
      direction === "prev" ? prev.subtract(1, "week") : prev.add(1, "week")
    );
  };

  return (
    <div className="teacher-schedule-page weekly-timetable teacher-view">
      <div className="hero-card">
        <div className="hero-card__text">
          <p className="eyebrow">Lịch giảng dạy</p>
          <Title level={3} style={{ marginBottom: 8 }}>
            Tuần: {formattedWeekRange}
          </Title>
          <Text type="secondary">
            Tổng số ca dạy: {weeklySchedule?.totalSlots ?? 0}
          </Text>
        </div>
        <div className="hero-card__actions">
          <Space className="hero-card__nav">
            <Tooltip title="Tuần trước">
              <Button
                shape="circle"
                icon={<LeftOutlined />}
                onClick={() => handleWeekChange("prev")}
              />
            </Tooltip>
            <Tooltip title="Tuần sau">
              <Button
                shape="circle"
                icon={<RightOutlined />}
                onClick={() => handleWeekChange("next")}
              />
            </Tooltip>
          </Space>
          <Space size="middle">
            <Button
              icon={<ReloadOutlined />}
              onClick={() => setSelectedWeek(dayjs())}
            >
              Về tuần hiện tại
            </Button>
            <DatePicker.WeekPicker
              value={selectedWeek}
              onChange={(date: dayjs.Dayjs | null) =>
                date && setSelectedWeek(date)
              }
              className="week-picker"
              format="YYYY-[Tuần] wo"
              placeholder="Chọn tuần"
              allowClear={false}
            />
          </Space>
        </div>
      </div>

      <Row gutter={[16, 16]} className="summary-grid">
        {summaryStats.map((stat) => (
          <Col xs={12} md={6} key={stat.label}>
            <Card className={`stat-card ${stat.accent}`}>
              <p>{stat.label}</p>
              <h3>{stat.value}</h3>
              <span>{stat.subtext}</span>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="timetable-card elevated">
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

      <Card className="legend-card">
        <div className="legend-card__header">
          <Text strong>Chú thích</Text>
        </div>
        <Space size="large" wrap>
          <Badge color="#52c41a" text="Đã dạy - lớp đã hoàn thành" />
          <Badge color="#ff4d4f" text="Vắng - lớp bị hủy/vắng" />
          <Badge color="#faad14" text="Sắp diễn ra" />
        </Space>
      </Card>
    </div>
  );
};

export default TeacherSchedule;
