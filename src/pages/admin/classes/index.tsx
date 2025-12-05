import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Row,
  Col,
  Select,
  Space,
  Table,
  Tag,
  Popconfirm,
  Tooltip,
  Steps,
  Tabs,
  DatePicker,
  InputNumber,
  Checkbox,
  Divider,
  Empty,
  Typography,
} from "antd";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import {
  BookOutlined,
  PlusOutlined,
  UserOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EditOutlined,
} from "@ant-design/icons";
import "./index.scss";
import type {
  ClassSummary,
  CreateClassRequest,
  CreateClassSlotRequest,
} from "../../../types/Class";
import type { TeacherOption } from "../../../types/Teacher";
import {
  createClassApi,
  fetchClassesApi,
  fetchTeachersApi,
  deleteClassApi,
  fetchTeachersForFilterApi,
  type TeacherFilterOption,
} from "../../../services/admin/classes/api";
import type { SubjectOffering } from "../../../types/SubjectOffering";
import { fetchSubjectOfferingsApi } from "../../../services/admin/subjectOfferings/api";
import { getSubjectByIdApi } from "../../../services/admin/subjects/api";
import { fetchEnrollmentsByClassApi } from "../../../services/admin/enrollments/api";
import type { TimeSlotDto } from "../../../types/TimeSlot";
import { getAllTimeSlots } from "../../../services/admin/timeSlots/api";
import type { SemesterDto } from "../../../types/Semester";
import { fetchSemestersApi } from "../../../services/admin/semesters/api";
import dayjs, { Dayjs } from "dayjs";

const { Text } = Typography;

const WEEKDAY_OPTIONS: Array<{ label: string; value: number }> = [
  { label: "Thứ 2", value: 1 },
  { label: "Thứ 3", value: 2 },
  { label: "Thứ 4", value: 3 },
  { label: "Thứ 5", value: 4 },
  { label: "Thứ 6", value: 5 },
  { label: "Thứ 7", value: 6 },
  { label: "Chủ nhật", value: 0 },
];

interface AutoPattern {
  label: string;
  value: number;
  enabled: boolean;
  timeSlotId?: string;
}

interface ScheduleEntry {
  id: string;
  date: Dayjs;
  timeSlotId?: string;
  substituteTeacherId?: string;
  substitutionReason?: string;
  notes?: string;
}

interface ManualSlotFormValues {
  date: Dayjs;
  timeSlotId: string;
  substituteTeacherId?: string;
  substitutionReason?: string;
  notes?: string;
}

interface ScheduleTableRow {
  key: string;
  index: number;
  dateText: string;
  weekday: string;
  timeSlotLabel: string;
  teacherName: string;
  substitutionReason?: string;
  notes?: string;
  entry: ScheduleEntry;
}

const generateTempId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? (crypto.randomUUID as () => string)()
    : Math.random().toString(36).substring(2, 9);

const createDefaultPatterns = (): AutoPattern[] =>
  WEEKDAY_OPTIONS.map((option) => ({
    ...option,
    enabled: false,
    timeSlotId: undefined,
  }));

const { Option } = Select;

const ClassesManagement: React.FC = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [subjectOfferings, setSubjectOfferings] = useState<SubjectOffering[]>(
    []
  );
  const [selectedOfferingSemester, setSelectedOfferingSemester] =
    useState<string>("all");
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [semesterFilter, setSemesterFilter] = useState<string>("all");
  const [teacherFilter, setTeacherFilter] = useState<string>("all");
  const [teachersForFilter, setTeachersForFilter] = useState<
    TeacherFilterOption[]
  >([]);
  const [selectedSubjectOfferingId, setSelectedSubjectOfferingId] = useState<
    string | undefined
  >(undefined);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingEnrollments, setPendingEnrollments] = useState<
    Record<string, number>
  >({});
  const [form] = Form.useForm<CreateClassRequest>();
  const [manualSlotForm] = Form.useForm<ManualSlotFormValues>();
  const [timeSlots, setTimeSlots] = useState<TimeSlotDto[]>([]);
  const [semesters, setSemesters] = useState<SemesterDto[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [activeScheduleTab, setActiveScheduleTab] = useState<"auto" | "manual">(
    "auto"
  );
  const [autoConfig, setAutoConfig] = useState<{
    startDate: Dayjs;
    slotCount: number;
  }>({
    startDate: dayjs().add(7, "day"),
    slotCount: 10,
  });
  const [autoScheduleMessage, setAutoScheduleMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [autoPatterns, setAutoPatterns] = useState<AutoPattern[]>(
    createDefaultPatterns()
  );
  const [editingScheduleEntryId, setEditingScheduleEntryId] = useState<
    string | null
  >(null);
  const [paginationState, setPaginationState] = useState<{
    current: number;
    pageSize: number;
    total: number;
  }>({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const resetScheduleBuilder = () => {
    setScheduleEntries([]);
    setAutoConfig({ startDate: dayjs().add(7, "day"), slotCount: 10 });
    setAutoPatterns(createDefaultPatterns());
    setActiveScheduleTab("auto");
    manualSlotForm.resetFields();
    setEditingScheduleEntryId(null);
    setAutoScheduleMessage(null); // Xóa message khi reset
  };

  const getTimeSlotById = useCallback(
    (id?: string) => timeSlots.find((slot) => slot.id === id),
    [timeSlots]
  );

  const getTimeSlotLabel = useCallback(
    (id?: string) => {
      const slot = getTimeSlotById(id);
      if (!slot) return "—";
      return `${slot.name} (${slot.startTime} - ${slot.endTime})`;
    },
    [getTimeSlotById]
  );

  const getTeacherName = useCallback(
    (id?: string) => {
      if (!id) return "";
      return teachers.find((teacher) => teacher.id === id)?.fullName || "";
    },
    [teachers]
  );

  const sortScheduleEntries = (entries: ScheduleEntry[]) =>
    [...entries].sort((a, b) => a.date.valueOf() - b.date.valueOf());

  const mapEntriesToPayload = (
    entries: ScheduleEntry[]
  ): CreateClassSlotRequest[] =>
    entries.map((entry) => ({
      date: entry.date.format("YYYY-MM-DD"),
      timeSlotId: entry.timeSlotId,
      substituteTeacherId: entry.substituteTeacherId || undefined,
      substitutionReason: entry.substitutionReason?.trim() || undefined,
      notes: entry.notes?.trim() || undefined,
    }));

  const loadPendingEnrollments = async (classList: ClassSummary[]) => {
    const enrollmentCounts: Record<string, number> = {};
    await Promise.all(
      classList.map(async (cls) => {
        try {
          const enrollments = await fetchEnrollmentsByClassApi(cls.id);
          const pendingOnly = enrollments.filter((e) => e.status === "Pending");
          enrollmentCounts[cls.id] = pendingOnly.length;
        } catch {
          enrollmentCounts[cls.id] = 0;
        }
      })
    );
    setPendingEnrollments(enrollmentCounts);
  };

  const loadClassList = async (overrides?: {
    page?: number;
    pageSize?: number;
    semesterId?: string;
    teacherId?: string;
  }) => {
    setLoading(true);
    try {
      const response = await fetchClassesApi({
        page: overrides?.page ?? paginationState.current,
        pageSize: overrides?.pageSize ?? paginationState.pageSize,
        semesterId:
          overrides?.semesterId ??
          (semesterFilter !== "all" ? semesterFilter : undefined),
        teacherId:
          overrides?.teacherId ??
          (teacherFilter !== "all" ? teacherFilter : undefined),
      });

      setClasses(response.items);
      setPaginationState({
        current: response.page,
        pageSize: response.pageSize,
        total: response.totalCount,
      });

      await loadPendingEnrollments(response.items);
    } catch {
      toast.error("Không thể tải dữ liệu lớp học");
    } finally {
      setLoading(false);
    }
  };

  const loadInitialData = async () => {
    try {
      const [
        offeringsRes,
        teacherRes,
        teachersForFilterRes,
        timeSlotRes,
        semestersRes,
      ] = await Promise.all([
        fetchSubjectOfferingsApi(),
        fetchTeachersApi(),
        fetchTeachersForFilterApi(),
        getAllTimeSlots(),
        fetchSemestersApi({ pageNumber: 1, pageSize: 100 }),
      ]);

      // Enrich SubjectOfferings with specializations from Subjects
      const enrichedOfferings = await Promise.all(
        offeringsRes.map(async (offering) => {
          try {
            const subject = await getSubjectByIdApi(offering.subjectId);
            return {
              ...offering,
              specializations: subject.specializations,
            };
          } catch {
            return offering;
          }
        })
      );

      // Enrich Teachers with specializations from TeachersForFilter
      const enrichedTeachers = teacherRes.map((teacher) => {
        const teacherDetail = teachersForFilterRes.find(
          (t) => t.id === teacher.id
        );
        // Note: TeacherFilterOption has specialization as string, not array
        // We'll need to map it if backend provides specializations array
        return teacher;
      });

      setSubjectOfferings(enrichedOfferings);
      setTeachers(enrichedTeachers);
      setTeachersForFilter(teachersForFilterRes);
      setTimeSlots(timeSlotRes);
      setSemesters(semestersRes.data);
    } catch {
      toast.error("Không thể tải dữ liệu tham chiếu");
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadInitialData();
      await loadClassList({ page: 1 });
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const semesterOptions = useMemo(() => {
    const map = new Map<string, string>();
    subjectOfferings.forEach((offering) => {
      if (!map.has(offering.semesterId)) {
        map.set(offering.semesterId, offering.semesterName);
      }
    });
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [subjectOfferings]);

  const filteredSubjectOfferings = useMemo(() => {
    if (selectedOfferingSemester === "all") {
      return subjectOfferings;
    }
    return subjectOfferings.filter(
      (offering) => offering.semesterId === selectedOfferingSemester
    );
  }, [subjectOfferings, selectedOfferingSemester]);

  // Filter teachers based on selected Subject Offering's specializations
  const filteredTeachers = useMemo(() => {
    if (!selectedSubjectOfferingId) {
      return teachers;
    }

    const selectedOffering = subjectOfferings.find(
      (offering) => offering.id === selectedSubjectOfferingId
    );

    if (
      !selectedOffering ||
      !selectedOffering.specializations ||
      selectedOffering.specializations.length === 0
    ) {
      // If no specializations required, show all teachers
      return teachers;
    }

    const requiredSpecializationIds = selectedOffering.specializations.map(
      (spec) => spec.id
    );

    // Filter teachers who have at least one matching specialization
    return teachers.filter((teacher) => {
      if (!teacher.specializations || teacher.specializations.length === 0) {
        return false;
      }
      const teacherSpecializationIds = teacher.specializations.map(
        (spec) => spec.id
      );
      // Check if there's any intersection
      return requiredSpecializationIds.some((reqId) =>
        teacherSpecializationIds.includes(reqId)
      );
    });
  }, [teachers, subjectOfferings, selectedSubjectOfferingId]);

  // Lấy thông tin học kỳ đã chọn ở Step 1 để hiển thị ở Step 2
  const selectedSemesterForStep2 = useMemo(() => {
    if (selectedOfferingSemester === "all") return null;
    return semesters.find((s) => s.id === selectedOfferingSemester);
  }, [selectedOfferingSemester, semesters]);

  const scheduleTableData = useMemo(
    () =>
      scheduleEntries.map((entry, index) => ({
        key: entry.id,
        index: index + 1,
        dateText: entry.date.format("DD/MM/YYYY"),
        weekday: entry.date.format("dddd"),
        timeSlotLabel: getTimeSlotLabel(entry.timeSlotId),
        teacherName: getTeacherName(entry.substituteTeacherId),
        substitutionReason: entry.substitutionReason,
        notes: entry.notes,
        entry,
      })),
    [scheduleEntries, getTeacherName, getTimeSlotLabel]
  );

  const stats = useMemo(() => {
    return {
      total: paginationState.total,
    };
  }, [paginationState.total]);

  const statsCards = [
    {
      label: "Tổng lớp học",
      value: stats.total,
      accent: "total",
      icon: <BookOutlined />,
    },
  ];

  const handleNavigateDetail = (classItem: ClassSummary) => {
    navigate(`/admin/classes/${classItem.classCode}?id=${classItem.id}`);
  };

  const columns: ColumnsType<ClassSummary> = [
    {
      title: "Lớp học",
      key: "classInfo",
      width: 220,
      render: (_, record) => (
        <div
          className="class-info clickable"
          onClick={() => handleNavigateDetail(record)}
          style={{ cursor: "pointer" }}
        >
          <div className="class-info__code">{record.classCode}</div>
          <div className="class-info__subject">
            {record.subjectCode} - {record.subjectName}
          </div>
        </div>
      ),
    },
    {
      title: "Giảng viên",
      dataIndex: "teacherName",
      key: "teacherName",
      width: 150,
      render: (teacherName: string) => (
        <div className="teacher-info">
          <UserOutlined className="teacher-icon" />
          <span>{teacherName}</span>
        </div>
      ),
    },
    {
      title: "Kỳ học",
      dataIndex: "semesterName",
      key: "semesterName",
      width: 120,
      render: (semesterName: string) => (
        <Tag color="blue" className="semester-tag">
          {semesterName}
        </Tag>
      ),
    },
    {
      title: "Tín chỉ",
      dataIndex: "credits",
      key: "credits",
      width: 80,
      align: "center",
      render: (credits: number) => (
        <span className="credit-value">{credits}</span>
      ),
    },
    {
      title: "Sĩ số",
      key: "capacity",
      width: 80,
      align: "center",
      render: (_, record) => (
        <span className="number-value">{record.currentEnrollment}</span>
      ),
    },
    {
      title: "Đăng ký",
      key: "enrollments",
      width: 90,
      align: "center",
      render: (_, record) => {
        const pendingCount = pendingEnrollments[record.id] || 0;
        return (
          <span className="number-value">
            {pendingCount > 0 ? (
              <Tag color="orange" style={{ margin: 0 }}>
                {pendingCount}
              </Tag>
            ) : (
              <span>0</span>
            )}
          </span>
        );
      },
    },
    {
      title: "Chỗ trống",
      key: "slots",
      width: 90,
      align: "center",
      render: (_, record) => (
        <span className="number-value">
          {record.maxEnrollment - record.currentEnrollment}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Popconfirm
          title="Xóa lớp học"
          description="Bạn có chắc chắn muốn xóa lớp học này không?"
          onConfirm={() => handleDelete(record.id)}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <Button
            type="primary"
            danger
            ghost
            icon={<DeleteOutlined />}
            size="small"
          >
            Xóa
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const scheduleColumns: ColumnsType<ScheduleTableRow> = [
    {
      title: "#",
      dataIndex: "index",
      width: 60,
      align: "center",
      render: (value: number) => value,
    },
    {
      title: "Ngày",
      dataIndex: "dateText",
      width: 140,
      render: (_: string, record) => (
        <div>
          <div className="schedule-date">{record.dateText}</div>
          <div className="schedule-weekday">{record.weekday}</div>
        </div>
      ),
    },
    {
      title: "Ca học",
      dataIndex: "timeSlotLabel",
      width: 200,
    },
    {
      title: "GV thay thế",
      dataIndex: "teacherName",
      width: 160,
      render: (text: string) => text || "—",
    },
    {
      title: "Lý do thay thế",
      dataIndex: "substitutionReason",
      width: 200,
      render: (text: string) => text || "—",
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      render: (text: string) => text || "—",
    },
    {
      title: "Hành động",
      key: "actions",
      width: 140,
      render: (_: unknown, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => handleEditScheduleEntry(record.entry)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa buổi học"
            description="Bạn có chắc muốn xóa buổi này?"
            onConfirm={() => handleDeleteScheduleEntry(record.entry.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" size="small" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await deleteClassApi(id);
      toast.success("Xóa lớp học thành công");
      await loadClassList();
    } catch {
      toast.error("Không thể xóa lớp học");
    } finally {
      setLoading(false);
    }
  };

  const handleSemesterFilterChange = (value: string) => {
    setSemesterFilter(value);
    loadClassList({
      page: 1,
      semesterId: value !== "all" ? value : undefined,
      teacherId: teacherFilter !== "all" ? teacherFilter : undefined,
    });
  };

  const handleTeacherFilterChange = (value: string) => {
    setTeacherFilter(value);
    loadClassList({
      page: 1,
      teacherId: value !== "all" ? value : undefined,
      semesterId: semesterFilter !== "all" ? semesterFilter : undefined,
    });
  };

  const handleReload = () => {
    loadClassList({
      page: 1,
      semesterId: semesterFilter !== "all" ? semesterFilter : undefined,
      teacherId: teacherFilter !== "all" ? teacherFilter : undefined,
    });
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    loadClassList({
      page: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  const handleNextStep = async () => {
    try {
      await form.validateFields();
      setCurrentStep(1);
    } catch {
      // validation errors are shown by antd
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleAutoPatternToggle = (value: number, checked: boolean) => {
    setAutoPatterns((prev) =>
      prev.map((pattern) =>
        pattern.value === value ? { ...pattern, enabled: checked } : pattern
      )
    );
    setAutoScheduleMessage(null); // Xóa message khi thay đổi pattern
  };

  const handleAutoPatternTimeSlotChange = (
    value: number,
    timeSlotId?: string
  ) => {
    setAutoPatterns((prev) =>
      prev.map((pattern) =>
        pattern.value === value ? { ...pattern, timeSlotId } : pattern
      )
    );
    setAutoScheduleMessage(null); // Xóa message khi thay đổi slot
  };

  const handleGenerateAutoSchedule = () => {
    // Xóa message trước khi validate
    setAutoScheduleMessage(null);

    if (!selectedSemesterForStep2) {
      setAutoScheduleMessage({
        type: "error",
        text: "Vui lòng chọn học kỳ ở bước 1",
      });
      return;
    }
    if (!autoConfig.startDate) {
      setAutoScheduleMessage({
        type: "error",
        text: "Vui lòng chọn ngày bắt đầu",
      });
      return;
    }
    if (autoConfig.slotCount <= 0) {
      setAutoScheduleMessage({
        type: "error",
        text: "Số buổi phải lớn hơn 0",
      });
      return;
    }
    const activePatterns = autoPatterns.filter(
      (pattern) => pattern.enabled && pattern.timeSlotId
    );
    if (activePatterns.length === 0) {
      setAutoScheduleMessage({
        type: "error",
        text: "Vui lòng chọn ít nhất 1 thứ và slot",
      });
      return;
    }

    const selectedSemester = selectedSemesterForStep2;
    if (!selectedSemester) {
      setAutoScheduleMessage({
        type: "error",
        text: "Không tìm thấy thông tin học kỳ",
      });
      return;
    }

    const semesterEndDate = dayjs(selectedSemester.endDate);
    const generated: ScheduleEntry[] = [];
    let currentDate = autoConfig.startDate.startOf("day");
    let guard = 0;

    while (generated.length < autoConfig.slotCount && guard < 365) {
      // Kiểm tra nếu ngày vượt quá ngày kết thúc học kỳ
      if (currentDate.isAfter(semesterEndDate, "day")) {
        setAutoScheduleMessage({
          type: "error",
          text: `Lịch học vượt quá ngày kết thúc học kỳ (${semesterEndDate.format(
            "DD/MM/YYYY"
          )}). Vui lòng điều chỉnh số buổi hoặc ngày bắt đầu.`,
        });
        return;
      }

      const pattern = activePatterns.find(
        (item) => item.value === currentDate.day()
      );
      if (pattern) {
        generated.push({
          id: generateTempId(),
          date: currentDate,
          timeSlotId: pattern.timeSlotId,
        });
      }
      currentDate = currentDate.add(1, "day");
      guard++;
    }

    if (generated.length === 0) {
      setAutoScheduleMessage({
        type: "error",
        text: "Không thể sinh lịch với cấu hình hiện tại",
      });
      return;
    }

    setScheduleEntries(sortScheduleEntries(generated));
    setAutoScheduleMessage({
      type: "success",
      text: `Đã sinh ${generated.length} buổi học`,
    });
  };

  const handleManualSlotSubmit = async () => {
    try {
      if (!selectedSemesterForStep2) {
        toast.error("Vui lòng chọn học kỳ ở bước 1 trước khi thêm buổi học");
        return;
      }

      const values = await manualSlotForm.validateFields();
      const selectedSemester = selectedSemesterForStep2;

      if (selectedSemester) {
        const semesterEndDate = dayjs(selectedSemester.endDate);
        const entryDate = dayjs(values.date);

        if (entryDate.isAfter(semesterEndDate, "day")) {
          toast.error(
            `Ngày học không được vượt quá ngày kết thúc học kỳ (${semesterEndDate.format(
              "DD/MM/YYYY"
            )})`
          );
          return;
        }
      }

      const baseEntry: ScheduleEntry = {
        id: editingScheduleEntryId ?? generateTempId(),
        date: values.date,
        timeSlotId: values.timeSlotId,
        substituteTeacherId: values.substituteTeacherId || undefined,
        substitutionReason: values.substitutionReason?.trim() || undefined,
        notes: values.notes?.trim() || undefined,
      };

      setScheduleEntries((prev) => {
        const next = editingScheduleEntryId
          ? prev.map((entry) =>
              entry.id === editingScheduleEntryId ? baseEntry : entry
            )
          : [...prev, baseEntry];
        return sortScheduleEntries(next);
      });

      manualSlotForm.resetFields();
      setEditingScheduleEntryId(null);
      toast.success(
        editingScheduleEntryId
          ? "Đã cập nhật buổi học"
          : "Đã thêm buổi học vào lịch"
      );
    } catch {
      // errors handled by antd
    }
  };

  const handleEditScheduleEntry = (entry: ScheduleEntry) => {
    manualSlotForm.setFieldsValue({
      date: entry.date,
      timeSlotId: entry.timeSlotId,
      substituteTeacherId: entry.substituteTeacherId,
      substitutionReason: entry.substitutionReason,
      notes: entry.notes,
    });
    setEditingScheduleEntryId(entry.id);
    setActiveScheduleTab("manual");
  };

  const handleCancelEditScheduleEntry = () => {
    manualSlotForm.resetFields();
    setEditingScheduleEntryId(null);
  };

  const handleDeleteScheduleEntry = (id: string) => {
    setScheduleEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleClearScheduleEntries = () => {
    setScheduleEntries([]);
    manualSlotForm.resetFields();
    setEditingScheduleEntryId(null);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);

      if (selectedOfferingSemester === "all") {
        toast.error("Vui lòng chọn học kỳ ở bước 1");
        setIsSubmitting(false);
        setCurrentStep(0);
        return;
      }

      // Validation: Kiểm tra Subject Offering có thuộc học kỳ đã chọn không
      const selectedSubjectOffering = subjectOfferings.find(
        (offering) => offering.id === values.subjectOfferingId
      );
      if (selectedSubjectOffering) {
        if (selectedSubjectOffering.semesterId !== selectedOfferingSemester) {
          toast.error(
            `Subject Offering "${selectedSubjectOffering.subjectCode}" không thuộc học kỳ đã chọn. Vui lòng chọn lại Subject Offering hoặc học kỳ.`
          );
          setIsSubmitting(false);
          setCurrentStep(0);
          return;
        }
      }

      if (scheduleEntries.length === 0) {
        toast.error("Vui lòng thiết lập lịch học cho lớp");
        setIsSubmitting(false);
        setCurrentStep(1);
        return;
      }

      // Validation: Kiểm tra các buổi học có vượt quá ngày kết thúc học kỳ không
      const selectedSemester = semesters.find(
        (s) => s.id === selectedOfferingSemester
      );
      if (selectedSemester) {
        const semesterEndDate = dayjs(selectedSemester.endDate);
        const invalidEntries = scheduleEntries.filter((entry) =>
          entry.date.isAfter(semesterEndDate, "day")
        );

        if (invalidEntries.length > 0) {
          toast.error(
            `Có ${
              invalidEntries.length
            } buổi học vượt quá ngày kết thúc học kỳ (${semesterEndDate.format(
              "DD/MM/YYYY"
            )}). Vui lòng điều chỉnh lại lịch học.`
          );
          setIsSubmitting(false);
          setCurrentStep(1);
          return;
        }
      }

      const payload: CreateClassRequest = {
        ...values,
        initialSlots: mapEntriesToPayload(scheduleEntries),
      };
      await createClassApi(payload);
      toast.success("Tạo lớp học thành công");

      setIsModalVisible(false);
      form.resetFields();
      resetScheduleBuilder();
      setCurrentStep(0);
      setSelectedSubjectOfferingId(undefined);
      await loadClassList({ page: 1 });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Không thể tạo lớp học mới");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    resetScheduleBuilder();
    setCurrentStep(0);
    setSelectedSubjectOfferingId(undefined);
  };

  const renderClassInfoForm = (hidden = false) => (
    <div style={{ display: hidden ? "none" : "block" }}>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          classCode: "",
          subjectOfferingId: undefined,
          teacherId: undefined,
        }}
      >
        <Form.Item label="Kỳ học">
          <Select
            placeholder="Chọn kỳ học để lọc Subject Offering"
            value={selectedOfferingSemester}
            onChange={(value) => setSelectedOfferingSemester(value)}
            allowClear={false}
          >
            <Option value="all">Tất cả kỳ học</Option>
            {semesters
              .filter((s) => !s.isClosed)
              .map((semester) => (
                <Option key={semester.id} value={semester.id}>
                  {semester.name} (
                  {dayjs(semester.startDate).format("DD/MM/YYYY")} -{" "}
                  {dayjs(semester.endDate).format("DD/MM/YYYY")})
                </Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="classCode"
          label="Mã lớp học"
          rules={[{ required: true, message: "Vui lòng nhập mã lớp học" }]}
        >
          <Input placeholder="VD: AI401-A" />
        </Form.Item>

        <Form.Item
          name="subjectOfferingId"
          label="Subject Offering"
          rules={[
            { required: true, message: "Vui lòng chọn subject offering" },
          ]}
        >
          <Select
            placeholder="Chọn subject offering"
            showSearch
            optionFilterProp="label"
            onChange={(value) => {
              setSelectedSubjectOfferingId(value);
              // Reset teacher selection when Subject Offering changes
              form.setFieldsValue({ teacherId: undefined });
            }}
          >
            {filteredSubjectOfferings.map((offering) => (
              <Option
                key={offering.id}
                value={offering.id}
                label={`${offering.semesterName} – ${offering.subjectCode}`}
              >
                {offering.semesterName} – {offering.subjectCode} (
                {offering.subjectName})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="teacherId"
          label="Giảng viên"
          rules={[{ required: true, message: "Vui lòng chọn giảng viên" }]}
          extra={
            selectedSubjectOfferingId &&
            filteredTeachers.length < teachers.length
              ? `Chỉ hiển thị ${filteredTeachers.length} giảng viên phù hợp với chuyên ngành của môn học`
              : undefined
          }
        >
          <Select
            placeholder="Chọn giảng viên"
            showSearch
            optionFilterProp="label"
            disabled={!selectedSubjectOfferingId}
            notFoundContent={
              selectedSubjectOfferingId && filteredTeachers.length === 0
                ? "Không có giảng viên phù hợp với chuyên ngành của môn học này"
                : "Không có dữ liệu"
            }
          >
            {filteredTeachers.map((teacher) => (
              <Option
                key={teacher.id}
                value={teacher.id}
                label={`${teacher.teacherCode} ${teacher.fullName}`}
              >
                {teacher.teacherCode} - {teacher.fullName}
                {teacher.specializations &&
                  teacher.specializations.length > 0 && (
                    <span
                      style={{
                        color: "#999",
                        fontSize: "12px",
                        marginLeft: "8px",
                      }}
                    >
                      ({teacher.specializations.map((s) => s.code).join(", ")})
                    </span>
                  )}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </div>
  );

  const renderAutoTabContent = () => {
    // Tính ngày tối thiểu: sau 1 tuần từ hiện tại
    const minDate = dayjs().add(7, "day").startOf("day");
    // Ngày tối đa: endDate của học kỳ đã chọn ở Step 1 (nếu có)
    const maxDate = selectedSemesterForStep2
      ? dayjs(selectedSemesterForStep2.endDate).endOf("day")
      : undefined;

    return (
      <div className="auto-config">
        {selectedSemesterForStep2 ? (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              background: "#f0f5ff",
              borderRadius: 6,
            }}
          >
            <Text strong style={{ display: "block", marginBottom: 4 }}>
              Học kỳ: {selectedSemesterForStep2.name}
            </Text>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Thời gian:{" "}
              {dayjs(selectedSemesterForStep2.startDate).format("DD/MM/YYYY")} -{" "}
              {dayjs(selectedSemesterForStep2.endDate).format("DD/MM/YYYY")}
            </Text>
          </div>
        ) : (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              background: "#fff7e6",
              borderRadius: 6,
            }}
          >
            <Text type="warning">
              Vui lòng chọn học kỳ ở bước 1 trước khi thiết lập lịch học
            </Text>
          </div>
        )}

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form layout="vertical">
              <Form.Item
                label="Ngày bắt đầu"
                required
                validateStatus={
                  !autoConfig.startDate || !selectedSemesterForStep2
                    ? "error"
                    : ""
                }
                help={
                  !selectedSemesterForStep2
                    ? "Vui lòng chọn học kỳ ở bước 1"
                    : !autoConfig.startDate
                    ? "Vui lòng chọn ngày bắt đầu"
                    : ""
                }
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  value={autoConfig.startDate}
                  onChange={(date) => {
                    setAutoConfig((prev) => ({
                      ...prev,
                      startDate: date || prev.startDate,
                    }));
                    setAutoScheduleMessage(null); // Xóa message khi thay đổi ngày
                  }}
                  disabled={!selectedSemesterForStep2}
                  disabledDate={(current) => {
                    if (!current) return false;
                    // Không cho chọn ngày trước 1 tuần từ hiện tại
                    if (current.isBefore(minDate, "day")) {
                      return true;
                    }
                    // Nếu đã chọn học kỳ, không cho chọn sau endDate
                    if (maxDate && current.isAfter(maxDate, "day")) {
                      return true;
                    }
                    return false;
                  }}
                  placeholder="Chọn ngày bắt đầu (sau 1 tuần từ hôm nay)"
                />
              </Form.Item>
            </Form>
          </Col>
          <Col xs={24} sm={12}>
            <Form layout="vertical">
              <Form.Item label="Số buổi cần tạo">
                <InputNumber
                  min={1}
                  max={40}
                  style={{ width: "100%" }}
                  value={autoConfig.slotCount}
                  onChange={(value) => {
                    setAutoConfig((prev) => ({
                      ...prev,
                      slotCount: Number(value) || prev.slotCount,
                    }));
                    setAutoScheduleMessage(null); // Xóa message khi thay đổi số buổi
                  }}
                />
              </Form.Item>
            </Form>
          </Col>
        </Row>

        <div className="weekday-pattern">
          {autoPatterns.map((pattern) => (
            <div key={pattern.value} className="pattern-item">
              <Checkbox
                checked={pattern.enabled}
                onChange={(e) =>
                  handleAutoPatternToggle(pattern.value, e.target.checked)
                }
              >
                {pattern.label}
              </Checkbox>
              <Select
                placeholder="Chọn slot"
                size="small"
                disabled={!pattern.enabled}
                value={pattern.timeSlotId}
                onChange={(value) =>
                  handleAutoPatternTimeSlotChange(pattern.value, value)
                }
                style={{ minWidth: 200 }}
              >
                {timeSlots.map((slot) => (
                  <Option key={slot.id} value={slot.id}>
                    {slot.name} ({slot.startTime} - {slot.endTime})
                  </Option>
                ))}
              </Select>
            </div>
          ))}
        </div>

        <div className="auto-actions">
          <Button type="primary" onClick={handleGenerateAutoSchedule}>
            Sinh lịch tự động
          </Button>
          {autoScheduleMessage && (
            <div style={{ marginTop: 8 }}>
              <Text
                type={
                  autoScheduleMessage.type === "success" ? "success" : "danger"
                }
                style={{ fontSize: 13 }}
              >
                {autoScheduleMessage.text}
              </Text>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderManualTabContent = () => {
    // Tính ngày tối thiểu: sau 1 tuần từ hiện tại
    const minDate = dayjs().add(7, "day").startOf("day");
    // Ngày tối đa: endDate của học kỳ đã chọn ở Step 1 (nếu có)
    const maxDate = selectedSemesterForStep2
      ? dayjs(selectedSemesterForStep2.endDate).endOf("day")
      : undefined;

    return (
      <div className="manual-config">
        {selectedSemesterForStep2 ? (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              background: "#f0f5ff",
              borderRadius: 6,
            }}
          >
            <Text strong style={{ display: "block", marginBottom: 4 }}>
              Học kỳ: {selectedSemesterForStep2.name}
            </Text>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Thời gian:{" "}
              {dayjs(selectedSemesterForStep2.startDate).format("DD/MM/YYYY")} -{" "}
              {dayjs(selectedSemesterForStep2.endDate).format("DD/MM/YYYY")}
            </Text>
          </div>
        ) : (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              background: "#fff7e6",
              borderRadius: 6,
            }}
          >
            <Text type="warning">
              Vui lòng chọn học kỳ ở bước 1 trước khi thiết lập lịch học
            </Text>
          </div>
        )}

        <Form form={manualSlotForm} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="date"
                label="Ngày học"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày học" },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      if (!selectedSemesterForStep2) {
                        return Promise.reject(
                          new Error("Vui lòng chọn học kỳ ở bước 1")
                        );
                      }
                      if (maxDate && dayjs(value).isAfter(maxDate, "day")) {
                        return Promise.reject(
                          new Error(
                            `Ngày học không được vượt quá ngày kết thúc học kỳ (${maxDate.format(
                              "DD/MM/YYYY"
                            )})`
                          )
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  disabled={!selectedSemesterForStep2}
                  disabledDate={(current) => {
                    if (!current) return false;
                    // Không cho chọn ngày trước 1 tuần từ hiện tại
                    if (current.isBefore(minDate, "day")) {
                      return true;
                    }
                    // Nếu đã chọn học kỳ, không cho chọn sau endDate
                    if (maxDate && current.isAfter(maxDate, "day")) {
                      return true;
                    }
                    return false;
                  }}
                  placeholder="Chọn ngày học (sau 1 tuần từ hôm nay)"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="timeSlotId"
                label="Ca học"
                rules={[{ required: true, message: "Vui lòng chọn ca học" }]}
              >
                <Select placeholder="Chọn slot">
                  {timeSlots.map((slot) => (
                    <Option key={slot.id} value={slot.id}>
                      {slot.name} ({slot.startTime} - {slot.endTime})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="substituteTeacherId"
                label="GV thay thế (nếu có)"
              >
                <Select placeholder="Chọn giảng viên" allowClear>
                  {teachers.map((teacher) => (
                    <Option key={teacher.id} value={teacher.id}>
                      {teacher.fullName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="substitutionReason" label="Lý do thay thế">
                <Input placeholder="Nhập lý do (nếu có)" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="notes" label="Ghi chú">
                <Input placeholder="Nhập ghi chú" />
              </Form.Item>
            </Col>
          </Row>

          <Space>
            <Button type="primary" onClick={handleManualSlotSubmit}>
              {editingScheduleEntryId ? "Cập nhật buổi" : "Thêm buổi"}
            </Button>
            {editingScheduleEntryId && (
              <Button onClick={handleCancelEditScheduleEntry}>
                Hủy chỉnh sửa
              </Button>
            )}
          </Space>
        </Form>
      </div>
    );
  };

  const renderScheduleBuilder = () => (
    <div className="schedule-step">
      {timeSlots.length === 0 ? (
        <Empty description="Chưa có TimeSlot để thiết lập lịch học" />
      ) : (
        <>
          <Tabs
            activeKey={activeScheduleTab}
            onChange={(key) => setActiveScheduleTab(key as "auto" | "manual")}
            items={[
              {
                key: "auto",
                label: "Sinh tự động",
                children: renderAutoTabContent(),
              },
              {
                key: "manual",
                label: "Nhập thủ công",
                children: renderManualTabContent(),
              },
            ]}
          />

          <Divider />

          <div className="schedule-table-header">
            <div>
              <h4>Danh sách buổi học</h4>
              <p>Hiện có {scheduleEntries.length} buổi</p>
            </div>
            {scheduleEntries.length > 0 && (
              <Button type="text" danger onClick={handleClearScheduleEntries}>
                Xóa tất cả
              </Button>
            )}
          </div>

          {scheduleEntries.length === 0 ? (
            <Empty description="Chưa có buổi học nào" />
          ) : (
            <Table
              columns={scheduleColumns}
              dataSource={scheduleTableData}
              pagination={false}
              size="small"
              className="schedule-table"
            />
          )}
        </>
      )}
    </div>
  );

  const renderModalContent = () => (
    <>
      {renderClassInfoForm(currentStep !== 0)}
      {currentStep === 1 && renderScheduleBuilder()}
    </>
  );

  const renderModalFooter = () => {
    if (currentStep === 0) {
      return [
        <Button key="cancel" onClick={handleModalCancel}>
          Hủy
        </Button>,
        <Button key="next" type="primary" onClick={handleNextStep}>
          Tiếp tục
        </Button>,
      ];
    }

    return [
      <Button key="cancel" onClick={handleModalCancel}>
        Hủy
      </Button>,
      <Button key="back" onClick={handlePrevStep}>
        Quay lại
      </Button>,
      <Button
        key="submit"
        type="primary"
        loading={isSubmitting}
        onClick={handleSubmit}
      >
        Tạo lớp
      </Button>,
    ];
  };

  return (
    <div className="classes-management">
      <Card className="classes-panel">
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 24 }}
        >
          <Col>
            <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 600 }}>
              Quản lý Lớp học
            </h2>
            <p style={{ margin: "4px 0 0 0", color: "#999", fontSize: "14px" }}>
              Quản lý các lớp học trong hệ thống
            </p>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReload}
                loading={loading}
              >
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  form.resetFields();
                  setSelectedOfferingSemester("all");
                  resetScheduleBuilder();
                  setCurrentStep(0);
                  setIsModalVisible(true);
                }}
                size="large"
              >
                Thêm lớp học
              </Button>
            </Space>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Lọc theo kỳ học"
              value={semesterFilter}
              onChange={handleSemesterFilterChange}
              style={{ width: "100%" }}
              allowClear
            >
              <Option value="all">Tất cả kỳ học</Option>
              {semesterOptions.map((semester) => (
                <Option key={semester.id} value={semester.id}>
                  {semester.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Lọc theo giảng viên"
              value={teacherFilter}
              onChange={handleTeacherFilterChange}
              style={{ width: "100%" }}
              allowClear
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) => {
                const label = option?.label as string | undefined;
                return (label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase());
              }}
            >
              <Option value="all">Tất cả giảng viên</Option>
              {teachersForFilter.map((teacher) => (
                <Option
                  key={teacher.id}
                  value={teacher.id}
                  label={teacher.fullName}
                >
                  {teacher.fullName} ({teacher.teacherCode})
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={classes}
          loading={loading}
          rowKey="id"
          className="custom-table"
          pagination={{
            current: paginationState.current,
            pageSize: paginationState.pageSize,
            total: paginationState.total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} lớp học`,
            position: ["bottomRight"],
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title="Tạo lớp học mới"
        open={isModalVisible}
        onCancel={handleModalCancel}
        destroyOnClose
        width={920}
        footer={renderModalFooter()}
      >
        <Steps
          size="small"
          current={currentStep}
          className="class-modal-steps"
          items={[{ title: "Thông tin lớp" }, { title: "Thiết lập lịch" }]}
        />
        <div className="modal-step-content">{renderModalContent()}</div>
      </Modal>
    </div>
  );
};

export default ClassesManagement;
