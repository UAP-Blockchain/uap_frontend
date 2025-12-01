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
import type {
  ScheduleItemDto,
  WeeklyScheduleDto,
} from "../../../types/Schedule";
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
      // Backend semantics:
      // - hasAttendance === true  => lớp đã được điểm danh (ĐÃ DẠY)
      // - hasAttendance === false => lớp chưa điểm danh (CHƯA DẠY)
      if (slot.hasAttendance === true) {
        return "attended";
      }

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

  const getStatusTag = (attendance?: string) => {
    switch (attendance) {
      case "attended":
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Đã dạy
          </Tag>
        );
      case "absent":
        return (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            Vắng
          </Tag>
        );
      case "not_yet":
        return (
          <Tag color="warning" icon={<ExclamationCircleOutlined />}>
            Chưa dạy
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
                <Text style={{ fontSize: 12 }}>
                  {info.courseName}
                  {info.location ? ` • ${info.location}` : ""}
                </Text>
              </div>
              <div className="attendance-status">
                {getStatusTag(info.attendance)}
              </div>
              <div className="time-info">
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {info.date && dayjs(info.date).isValid()
                    ? dayjs(info.date).format("DD/MM/YYYY")
                    : "—"}
                </Text>
              </div>
            </div>
          ))}
        </div>
      );
    },
    [handleNavigateClass, handleOpenAttendanceModal]
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
                  {weeklySchedule?.weekLabel ||
                    `Tuần: ${getMondayOfWeek(selectedWeek).format(
                      "DD/MM"
                    )} - ${getMondayOfWeek(selectedWeek)
                      .add(6, "day")
                      .format("DD/MM/YYYY")}`}
                </Title>
                <Text type="secondary">
                  Tổng số ca dạy: {weeklySchedule?.totalSlots ?? 0}
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
              <Badge color="#52c41a" text="Đã dạy - Lớp đã hoàn thành" />
              <Badge color="#ff4d4f" text="Vắng - Lớp bị hủy/vắng" />
              <Badge color="#faad14" text="Chưa dạy - Lớp sắp diễn ra" />
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default TeacherSchedule;
