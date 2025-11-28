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
} from "antd";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import {
  BookOutlined,
  PlusOutlined,
  UserOutlined,
  DeleteOutlined,
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
} from "../../../services/admin/classes/api";
import type { SubjectOffering } from "../../../types/SubjectOffering";
import { fetchSubjectOfferingsApi } from "../../../services/admin/subjectOfferings/api";
import { fetchEnrollmentsByClassApi } from "../../../services/admin/enrollments/api";
import type { TimeSlotDto } from "../../../types/TimeSlot";
import { getAllTimeSlots } from "../../../services/admin/timeSlots/api";
import dayjs, { Dayjs } from "dayjs";

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

const { Search } = Input;
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
  const [searchText, setSearchText] = useState("");
  const [semesterFilter, setSemesterFilter] = useState<string>("all");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingEnrollments, setPendingEnrollments] = useState<
    Record<string, number>
  >({});
  const [form] = Form.useForm<CreateClassRequest>();
  const [manualSlotForm] = Form.useForm<ManualSlotFormValues>();
  const [timeSlots, setTimeSlots] = useState<TimeSlotDto[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [activeScheduleTab, setActiveScheduleTab] = useState<"auto" | "manual">(
    "auto"
  );
  const [autoConfig, setAutoConfig] = useState<{
    startDate: Dayjs;
    slotCount: number;
  }>({
    startDate: dayjs(),
    slotCount: 10,
  });
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
    setAutoConfig({ startDate: dayjs(), slotCount: 10 });
    setAutoPatterns(createDefaultPatterns());
    setActiveScheduleTab("auto");
    manualSlotForm.resetFields();
    setEditingScheduleEntryId(null);
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
      date: entry.date.toISOString(),
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
    searchTerm?: string;
    semesterId?: string;
  }) => {
    setLoading(true);
    try {
      const response = await fetchClassesApi({
        page: overrides?.page ?? paginationState.current,
        pageSize: overrides?.pageSize ?? paginationState.pageSize,
        searchTerm: overrides?.searchTerm ?? (searchText.trim() || undefined),
        semesterId:
          overrides?.semesterId ??
          (semesterFilter !== "all" ? semesterFilter : undefined),
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
      const [offeringsRes, teacherRes, timeSlotRes] = await Promise.all([
        fetchSubjectOfferingsApi(),
        fetchTeachersApi(),
        getAllTimeSlots(),
      ]);
      setSubjectOfferings(offeringsRes);
      setTeachers(teacherRes);
      setTimeSlots(timeSlotRes);
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

  const offeringSemesterOptions = useMemo(() => {
    const semesters = Array.from(
      new Set(subjectOfferings.map((offering) => offering.semesterName))
    );
    return semesters.sort((a, b) => a.localeCompare(b));
  }, [subjectOfferings]);

  useEffect(() => {
    if (
      selectedOfferingSemester !== "all" &&
      !offeringSemesterOptions.includes(selectedOfferingSemester)
    ) {
      setSelectedOfferingSemester("all");
    }
  }, [offeringSemesterOptions, selectedOfferingSemester]);

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

  const filteredSubjectOfferings = useMemo(() => {
    if (selectedOfferingSemester === "all") {
      return subjectOfferings;
    }
    return subjectOfferings.filter(
      (offering) => offering.semesterName === selectedOfferingSemester
    );
  }, [subjectOfferings, selectedOfferingSemester]);

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
          title="Bạn có chắc chắn muốn xóa lớp học này?"
          onConfirm={() => handleDelete(record.id)}
          okText="Có"
          cancelText="Không"
        >
          <Tooltip title="Xóa">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              className="action-btn-delete"
            />
          </Tooltip>
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

  const handleSearch = (value: string) => {
    setSearchText(value);
    loadClassList({
      page: 1,
      searchTerm: value.trim() || undefined,
    });
  };

  const handleSemesterFilterChange = (value: string) => {
    setSemesterFilter(value);
    loadClassList({
      page: 1,
      semesterId: value !== "all" ? value : undefined,
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
  };

  const handleGenerateAutoSchedule = () => {
    if (!autoConfig.startDate) {
      toast.error("Vui lòng chọn ngày bắt đầu");
      return;
    }
    if (autoConfig.slotCount <= 0) {
      toast.error("Số buổi phải lớn hơn 0");
      return;
    }
    const activePatterns = autoPatterns.filter(
      (pattern) => pattern.enabled && pattern.timeSlotId
    );
    if (activePatterns.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 thứ và slot");
      return;
    }
    const generated: ScheduleEntry[] = [];
    let currentDate = autoConfig.startDate.startOf("day");
    let guard = 0;

    while (generated.length < autoConfig.slotCount && guard < 365) {
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
      toast.error("Không thể sinh lịch với cấu hình hiện tại");
      return;
    }

    setScheduleEntries(sortScheduleEntries(generated));
    toast.success(`Đã sinh ${generated.length} buổi học`);
  };

  const handleManualSlotSubmit = async () => {
    try {
      const values = await manualSlotForm.validateFields();
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

      if (scheduleEntries.length === 0) {
        toast.error("Vui lòng thiết lập lịch học cho lớp");
        setIsSubmitting(false);
        setCurrentStep(1);
        return;
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
            {offeringSemesterOptions.map((semester) => (
              <Option key={semester} value={semester}>
                {semester}
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
        >
          <Select
            placeholder="Chọn giảng viên"
            showSearch
            optionFilterProp="label"
          >
            {teachers.map((teacher) => (
              <Option
                key={teacher.id}
                value={teacher.id}
                label={`${teacher.teacherCode} ${teacher.fullName}`}
              >
                {teacher.teacherCode} - {teacher.fullName}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </div>
  );

  const renderAutoTabContent = () => (
    <div className="auto-config">
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form layout="vertical">
            <Form.Item label="Ngày bắt đầu">
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                value={autoConfig.startDate}
                onChange={(date) =>
                  setAutoConfig((prev) => ({
                    ...prev,
                    startDate: date || prev.startDate,
                  }))
                }
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
                onChange={(value) =>
                  setAutoConfig((prev) => ({
                    ...prev,
                    slotCount: Number(value) || prev.slotCount,
                  }))
                }
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
      </div>
    </div>
  );

  const renderManualTabContent = () => (
    <div className="manual-config">
      <Form form={manualSlotForm} layout="vertical">
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              name="date"
              label="Ngày học"
              rules={[{ required: true, message: "Vui lòng chọn ngày học" }]}
            >
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
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
            <Form.Item name="substituteTeacherId" label="GV thay thế (nếu có)">
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
        <div className="overview-header">
          <div className="title-block">
            <div className="title-icon">
              <BookOutlined />
            </div>
            <div>
              <p className="eyebrow">Bảng quản trị</p>
              <h2>Quản lý Lớp học</h2>
            </div>
          </div>
          <div className="header-actions">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="primary-action"
              onClick={() => {
                form.resetFields();
                setSelectedOfferingSemester("all");
                resetScheduleBuilder();
                setCurrentStep(0);
                setIsModalVisible(true);
              }}
            >
              Thêm lớp học
            </Button>
          </div>
        </div>

        <div className="stats-compact">
          {statsCards.map((stat) => (
            <div key={stat.label} className={`stat-chip ${stat.accent}`}>
              <span className="value">{stat.value}</span>
              <span className="label">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="filters-row compact-layout">
          <Row gutter={[12, 12]} align="middle" className="filter-row-compact">
            <Col xs={24} sm={24} md={12} lg={14} xl={16}>
              <Search
                placeholder="Tìm kiếm mã lớp, môn học, giảng viên..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  if (e.target.value === "") {
                    handleSearch("");
                  }
                }}
                onSearch={handleSearch}
                allowClear
                size="middle"
                enterButton="Tìm"
              />
            </Col>
            <Col xs={12} sm={12} md={6} lg={5} xl={4}>
              <Select
                value={semesterFilter}
                onChange={handleSemesterFilterChange}
                size="middle"
                className="semester-select-compact"
                style={{ width: "100%" }}
              >
                <Option value="all">Tất cả</Option>
                {semesterOptions.map((semester) => (
                  <Option key={semester.id} value={semester.id}>
                    {semester.name}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </div>

        <div className="table-section">
          <Table
            columns={columns}
            dataSource={classes}
            loading={loading}
            rowKey="id"
            pagination={{
              current: paginationState.current,
              pageSize: paginationState.pageSize,
              total: paginationState.total,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total}`,
              size: "small",
            }}
            onChange={handleTableChange}
            scroll={{ x: 1000 }}
            size="small"
          />
        </div>
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
