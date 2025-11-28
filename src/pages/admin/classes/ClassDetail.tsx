import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  Table,
  Button,
  Tag,
  Descriptions,
  Spin,
  Typography,
  Modal,
  Space,
  Form,
  Input,
  Select,
  Empty,
  DatePicker,
  Divider,
  Row,
  Col,
  InputNumber,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ArrowLeft,
  Calendar,
  Users,
  BookOpen,
  User,
  UserPlus,
  Inbox,
  GraduationCap,
  PlusCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  assignStudentsToClassApi,
  getClassByIdApi,
  getClassRosterApi,
  getEligibleStudentsForClassApi,
  updateClassApi,
  fetchSubjectsApi,
  fetchTeachersApi,
  getClassSlotsApi,
  createSlotApi,
  updateSlotApi,
  deleteSlotApi,
  type StudentRoster,
} from "../../../services/admin/classes/api";
import type { EligibleStudent } from "../../../types/Class";
import {
  approveEnrollmentApi,
  fetchEnrollmentsByClassApi,
  rejectEnrollmentApi,
  type EnrollmentRequest,
} from "../../../services/admin/enrollments/api";
import type { ClassSummary } from "../../../types/Class";
import type { SubjectDto } from "../../../types/Subject";
import type { TeacherOption } from "../../../types/Teacher";
import type { SlotDto, UpdateSlotRequest } from "../../../types/Slot";
import { getAllTimeSlots } from "../../../services/admin/timeSlots/api";
import type { TimeSlotDto } from "../../../types/TimeSlot";
import dayjs, { Dayjs } from "dayjs";
import "./ClassDetail.scss";

const { Title, Text } = Typography;
const { Option } = Select;

interface AdditionalSlotFormValues {
  date: Dayjs;
  timeSlotId: string;
  substituteTeacherId?: string;
  substitutionReason?: string;
  notes?: string;
}

const SLOT_STATUS_OPTIONS: UpdateSlotRequest["status"][] = [
  "Scheduled",
  "Completed",
  "Cancelled",
];

const ClassDetail: React.FC = () => {
  const { classCode } = useParams<{ classCode: string }>();
  const [searchParams] = useSearchParams();
  const classId = searchParams.get("id");
  const navigate = useNavigate();
  const [classInfo, setClassInfo] = useState<ClassSummary | null>(null);
  const [students, setStudents] = useState<StudentRoster[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [enrollments, setEnrollments] = useState<EnrollmentRequest[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState<boolean>(false);
  const [isEnrollmentsModalOpen, setIsEnrollmentsModalOpen] =
    useState<boolean>(false);
  const [rejectModal, setRejectModal] = useState<{
    visible: boolean;
    id: string | null;
  }>({ visible: false, id: null });
  const [rejectReason, setRejectReason] = useState<string>("");
  const [isAddStudentsModalOpen, setIsAddStudentsModalOpen] =
    useState<boolean>(false);
  const [eligibleStudents, setEligibleStudents] = useState<EligibleStudent[]>(
    []
  );
  const [eligibleLoading, setEligibleLoading] = useState<boolean>(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<React.Key[]>([]);
  const [assigningStudents, setAssigningStudents] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [form] = Form.useForm<{
    classCode: string;
    subjectOfferingId: string;
    teacherId: string;
    maxEnrollment: number;
  }>();
  const [scheduleSlots, setScheduleSlots] = useState<SlotDto[]>([]);
  const [slotsLoading, setSlotsLoading] = useState<boolean>(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlotDto[]>([]);
  const [slotForm] = Form.useForm<AdditionalSlotFormValues>();
  const [editSlotForm] = Form.useForm<{
    date: Dayjs;
    timeSlotId?: string;
    substituteTeacherId?: string;
    substitutionReason?: string;
    notes?: string;
    status: UpdateSlotRequest["status"];
  }>();
  const [slotModalVisible, setSlotModalVisible] = useState(false);
  const [slotModalLoading, setSlotModalLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotDto | null>(null);

  const setFormValuesFromClassInfo = useCallback(
    (
      info: ClassSummary,
      subjectList?: SubjectDto[],
      teacherList?: TeacherOption[]
    ) => {
      const subjectsData = subjectList ?? subjects;
      const teachersData = teacherList ?? teachers;

      const matchedSubject =
        subjectsData.find((item) => item.subjectCode === info.subjectCode) ||
        subjectsData.find((item) => item.subjectName === info.subjectName);
      const matchedTeacher =
        teachersData.find((item) => item.teacherCode === info.teacherCode) ||
        teachersData.find((item) => item.fullName === info.teacherName);

      form.setFieldsValue({
        classCode: info.classCode,
        subjectOfferingId: matchedSubject?.id ?? info.subjectOfferingId ?? info.subjectCode,
        teacherId: matchedTeacher?.id ?? info.teacherCode,
        maxEnrollment: info.maxEnrollment,
      });
    },
    [form, subjects, teachers]
  );

  const loadClassDetail = useCallback(
    async (id: string, options?: { showLoading?: boolean }) => {
      const shouldShowLoading = options?.showLoading ?? true;
      if (shouldShowLoading) {
        setLoading(true);
      }
      try {
        setSlotsLoading(true);
        const [classData, rosterData, slotData] = await Promise.all([
          getClassByIdApi(id),
          getClassRosterApi(id),
          getClassSlotsApi(id),
        ]);
        setClassInfo(classData);
        setStudents(rosterData);
        setScheduleSlots(slotData);
      } catch {
        toast.error("Không thể tải thông tin lớp học");
        navigate("/admin/classes");
      } finally {
        if (shouldShowLoading) {
          setLoading(false);
        }
        setSlotsLoading(false);
      }
    },
    [navigate]
  );

  const loadEnrollments = useCallback(async (id: string) => {
    setEnrollmentsLoading(true);
    try {
      const data = await fetchEnrollmentsByClassApi(id);
      const pendingEnrollments = data.filter(
        (item) => item.status?.toLowerCase() === "pending"
      );
      setEnrollments(pendingEnrollments);
    } catch {
      toast.error("Không thể tải danh sách đơn đăng ký");
    } finally {
      setEnrollmentsLoading(false);
    }
  }, []);

  const loadEligibleStudents = useCallback(async (id: string) => {
    setEligibleLoading(true);
    try {
      const data = await getEligibleStudentsForClassApi(id);
      setEligibleStudents(data);
    } catch {
      toast.error("Không thể tải danh sách sinh viên đủ điều kiện");
    } finally {
      setEligibleLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!classId) {
      toast.error("Không tìm thấy thông tin lớp học");
      navigate("/admin/classes");
      return;
    }

    loadClassDetail(classId);
  }, [classId, loadClassDetail, navigate]);

  useEffect(() => {
    const loadTimeSlots = async () => {
      try {
        const slots = await getAllTimeSlots();
        setTimeSlots(slots);
      } catch {
        toast.error("Không thể tải danh sách ca học");
      }
    };
    loadTimeSlots();
  }, []);

  const handleOpenEnrollmentsModal = () => {
    if (!classId) {
      toast.error("Không tìm thấy thông tin lớp học");
      return;
    }
    // Gọi API mỗi lần mở modal để bạn thấy request trong Network
    loadEnrollments(classId);
    setIsEnrollmentsModalOpen(true);
  };

  const handleOpenAddStudentsModal = () => {
    if (!classId) {
      toast.error("Không tìm thấy thông tin lớp học");
      return;
    }
    loadEligibleStudents(classId);
    setSelectedStudentIds([]);
    setIsAddStudentsModalOpen(true);
  };

  const handleStartEdit = async () => {
    if (!classInfo) {
      return;
    }

    let subjectsData = subjects;
    let teachersData = teachers;

    if (!subjectsData.length || !teachersData.length) {
      try {
        const [loadedSubjects, loadedTeachers] = await Promise.all([
          fetchSubjectsApi(),
          fetchTeachersApi(),
        ]);
        subjectsData = loadedSubjects;
        teachersData = loadedTeachers;
        setSubjects(loadedSubjects);
        setTeachers(loadedTeachers);
      } catch {
        toast.error("Không thể tải dữ liệu môn học hoặc giảng viên");
        return;
      }
    }

    setIsEditing(true);
    setTimeout(() => {
      setFormValuesFromClassInfo(classInfo, subjectsData, teachersData);
      slotForm.resetFields();
    }, 0);
  };

  const handleCancelEdit = () => {
    form.resetFields();
    slotForm.resetFields();
    setIsEditing(false);
  };

  const handleSubmitEdit = async (values: {
    classCode: string;
    subjectOfferingId: string;
    teacherId: string;
    maxEnrollment: number;
  }) => {
    if (!classInfo || !classId) {
      return;
    }

    const payload = {
      classCode: values.classCode.trim(),
      subjectOfferingId: values.subjectOfferingId,
      teacherId: values.teacherId,
      maxEnrollment: values.maxEnrollment,
    };

    setIsSaving(true);
    try {
      await updateClassApi(classInfo.id, payload);
      toast.success("Cập nhật lớp học thành công");
      setIsEditing(false);
      await loadClassDetail(classInfo.id, { showLoading: false });

      if (payload.classCode !== classInfo.classCode) {
        navigate(`/admin/classes/${payload.classCode}?id=${classInfo.id}`, {
          replace: true,
        });
      }
    } catch {
      toast.error("Không thể cập nhật lớp học");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async (record: EnrollmentRequest) => {
    try {
      await approveEnrollmentApi(record.id);
      toast.success("Duyệt đơn đăng ký thành công");

      setEnrollments((prev) => prev.filter((item) => item.id !== record.id));
      setStudents((prev) => {
        const exists = prev.some((student) => student.id === record.studentId);
        if (exists) {
          return prev;
        }
        return [
          ...prev,
          {
            id: record.studentId,
            studentId: record.studentId,
            studentCode: record.studentCode,
            fullName: record.studentName,
            email: record.studentEmail,
            enrollmentDate: record.registeredAt,
          },
        ];
      });
      setClassInfo((prev) =>
        prev
          ? {
              ...prev,
              totalStudents: prev.totalStudents + 1,
              totalSlots: Math.max(prev.totalSlots - 1, 0),
            }
          : prev
      );

      if (classId) {
        await loadEnrollments(classId);
        await loadClassDetail(classId, { showLoading: false });
      }
    } catch {
      toast.error("Không thể duyệt đơn đăng ký");
    }
  };

  const handleReject = (record: EnrollmentRequest) => {
    setRejectModal({ visible: true, id: record.id });
    setRejectReason("");
  };

  const handleConfirmReject = async () => {
    if (!rejectModal.id || !rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }
    try {
      await rejectEnrollmentApi(rejectModal.id, rejectReason.trim());
      toast.success("Từ chối đơn đăng ký thành công");
      setRejectModal({ visible: false, id: null });
      setRejectReason("");
      if (classId) {
        await loadEnrollments(classId);
      }
    } catch {
      toast.error("Không thể từ chối đơn đăng ký");
    }
  };

  const handleAssignStudents = async () => {
    if (!classId) {
      toast.error("Không tìm thấy thông tin lớp học");
      return;
    }

    if (selectedStudentIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sinh viên");
      return;
    }

    setAssigningStudents(true);
    try {
      const studentIds = selectedStudentIds.map((id) => String(id));
      await assignStudentsToClassApi(classId, studentIds);
      toast.success("Thêm sinh viên vào lớp thành công");
      setIsAddStudentsModalOpen(false);
      setSelectedStudentIds([]);
      await loadClassDetail(classId, { showLoading: false });
    } catch {
      toast.error("Không thể thêm sinh viên vào lớp");
    } finally {
      setAssigningStudents(false);
    }
  };

  const handleAddNewSlot = async () => {
    if (!classInfo) {
      toast.error("Không tìm thấy thông tin lớp học");
      return;
    }
    try {
      const values = await slotForm.validateFields();
      setSlotsLoading(true);
      await createSlotApi({
        classId: classInfo.id,
        date: values.date.toISOString(),
        timeSlotId: values.timeSlotId,
        substituteTeacherId: values.substituteTeacherId,
        substitutionReason: values.substitutionReason?.trim() || undefined,
        notes: values.notes?.trim() || undefined,
      });
      toast.success("Đã thêm buổi học mới");
      slotForm.resetFields();
      await loadClassDetail(classInfo.id, { showLoading: false });
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      toast.error(error?.message || "Không thể thêm buổi học");
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleEditSlot = (slot: SlotDto) => {
    setSelectedSlot(slot);
    const safeStatus = SLOT_STATUS_OPTIONS.includes(
      slot.status as UpdateSlotRequest["status"]
    )
      ? (slot.status as UpdateSlotRequest["status"])
      : "Scheduled";

    editSlotForm.setFieldsValue({
      date: dayjs(slot.date),
      timeSlotId: slot.timeSlotId,
      substituteTeacherId: slot.substituteTeacherId,
      substitutionReason: slot.substitutionReason,
      notes: slot.notes,
      status: safeStatus,
    });
    setSlotModalVisible(true);
  };

  const handleUpdateSlot = async () => {
    if (!selectedSlot) return;
    try {
      const values = await editSlotForm.validateFields();
      setSlotModalLoading(true);
      await updateSlotApi(selectedSlot.id, {
        date: values.date.toISOString(),
        timeSlotId: values.timeSlotId,
        substituteTeacherId: values.substituteTeacherId,
        substitutionReason: values.substitutionReason?.trim() || undefined,
        status: values.status,
        notes: values.notes?.trim() || undefined,
      });
      toast.success("Cập nhật buổi học thành công");
      setSlotModalVisible(false);
      if (classInfo) {
        await loadClassDetail(classInfo.id, { showLoading: false });
      }
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      toast.error(error?.message || "Không thể cập nhật buổi học");
    } finally {
      setSlotModalLoading(false);
    }
  };

  const handleDeleteSlot = (slotId: string) => {
    if (!classInfo) return;
    Modal.confirm({
      title: "Xóa buổi học",
      content: "Bạn có chắc chắn muốn xóa buổi học này?",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setSlotsLoading(true);
          await deleteSlotApi(slotId);
          toast.success("Đã xóa buổi học");
          await loadClassDetail(classInfo.id, { showLoading: false });
        } catch (error) {
          if (error instanceof Error) {
            toast.error(error.message);
          }
        } finally {
          setSlotsLoading(false);
        }
      },
    });
  };

  const columns: ColumnsType<StudentRoster> = [
    {
      title: "Mã sinh viên",
      dataIndex: "studentCode",
      key: "studentCode",
      width: 150,
      render: (code: string) => (
        <div className="student-code">
          <User className="student-icon" size={16} />
          <span>{code}</span>
        </div>
      ),
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      width: 250,
      render: (name: string) => <span className="student-name">{name}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 250,
      render: (email: string) => <span className="student-email">{email}</span>,
    },
    {
      title: "Ngày đăng ký",
      dataIndex: "enrollmentDate",
      key: "enrollmentDate",
      width: 150,
      render: (date?: string) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
  ];

  const enrollmentColumns: ColumnsType<EnrollmentRequest> = [
    {
      title: "Mã sinh viên",
      dataIndex: "studentCode",
      key: "studentCode",
      width: 130,
    },
    {
      title: "Họ và tên",
      dataIndex: "studentName",
      key: "studentName",
      width: 200,
    },
    {
      title: "Email",
      dataIndex: "studentEmail",
      key: "studentEmail",
      width: 220,
    },
    {
      title: "Thời gian đăng ký",
      dataIndex: "registeredAt",
      key: "registeredAt",
      width: 180,
      render: (date?: string) =>
        date ? new Date(date).toLocaleString("vi-VN") : "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        if (status === "Pending") {
          return <Tag color="orange">Chờ duyệt</Tag>;
        }
        return status;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 160,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            onClick={() => handleApprove(record)}
          >
            Duyệt
          </Button>
          <Button danger size="small" onClick={() => handleReject(record)}>
            Từ chối
          </Button>
        </Space>
      ),
    },
  ];

  const eligibleColumns: ColumnsType<EligibleStudent> = [
    {
      title: "Mã sinh viên",
      dataIndex: "studentCode",
      key: "studentCode",
      width: 130,
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      width: 200,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 220,
    },
    {
      title: "GPA",
      dataIndex: "gpa",
      key: "gpa",
      width: 80,
      render: (value?: number) =>
        typeof value === "number" ? value.toFixed(2) : "-",
    },
    {
      title: "Chuyên ngành",
      dataIndex: "major",
      key: "major",
      width: 160,
      render: (value?: string) => value || "-",
    },
  ];

  const scheduleColumns: ColumnsType<SlotDto> = [
    {
      title: "#",
      dataIndex: "index",
      width: 60,
      render: (_: any, __: SlotDto, index: number) => index + 1,
    },
    {
      title: "Ngày",
      dataIndex: "date",
      width: 140,
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Ca học",
      dataIndex: "timeSlotName",
      width: 160,
      render: (value?: string) => value || "-",
    },
    {
      title: "Khung giờ",
      key: "timeRange",
      width: 160,
      render: (_, record) =>
        record.startTime && record.endTime
          ? `${record.startTime} - ${record.endTime}`
          : "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 120,
      render: (status: string) => <Tag color="blue">{status}</Tag>,
    },
    {
      title: "GV thay thế",
      dataIndex: "substituteTeacherName",
      width: 200,
      render: (value?: string) => value || "-",
    },
  ];

  if (loading) {
    return (
      <div className="class-detail-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!classInfo) {
    return null;
  }

  return (
    <div className="class-detail">
      <div className="class-detail-header">
        <div className="header-left">
          <Button
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate("/admin/classes")}
            className="back-button"
          >
            Quay lại
          </Button>
          <Title level={2} className="page-title">
            {classCode ? `Chi tiết lớp ${classCode}` : "Chi tiết lớp học"}
          </Title>
        </div>
        <div className="header-actions">
          {isEditing ? (
            <Space size="small">
              <Button onClick={handleCancelEdit} disabled={isSaving}>
                Hủy
              </Button>
              <Button
                type="primary"
                onClick={() => form.submit()}
                loading={isSaving}
              >
                Lưu thay đổi
              </Button>
            </Space>
          ) : (
            <Button type="default" onClick={handleStartEdit}>
              Chỉnh sửa
            </Button>
          )}
          <Button
            icon={<PlusCircle size={16} />}
            onClick={handleOpenAddStudentsModal}
            disabled={isEditing}
          >
            Thêm học sinh
          </Button>
          <Button type="primary" onClick={handleOpenEnrollmentsModal}>
            Danh sách đơn
          </Button>
        </div>
      </div>

      <Card className={`class-info-card${isEditing ? " editing" : ""}`}>
        <div className="class-info-header">
          <div className="class-icon-wrapper">
            <GraduationCap size={24} />
          </div>
          <div className="class-info-content">
            <Title level={3} className="class-name">
              {classInfo.classCode}
            </Title>
            <p className="class-subject">
              {classInfo.subjectCode} - {classInfo.subjectName}
            </p>
          </div>
        </div>

        {isEditing ? (
          <Form
            form={form}
            layout="vertical"
            className="class-edit-form"
            onFinish={handleSubmitEdit}
          >
            <div className="class-form-grid">
              <Form.Item
                name="classCode"
                label="Mã lớp"
                rules={[{ required: true, message: "Vui lòng nhập mã lớp!" }]}
              >
                <Input placeholder="Nhập mã lớp" size="large" />
              </Form.Item>
              <Form.Item
                name="subjectOfferingId"
                label="Môn học"
                rules={[{ required: true, message: "Vui lòng chọn môn học!" }]}
              >
                <Select
                  placeholder="Chọn môn học"
                  showSearch
                  optionFilterProp="label"
                  optionLabelProp="label"
                  size="large"
                  loading={!subjects.length}
                >
                  {subjects.map((subject) => (
                    <Option
                      key={subject.id}
                      value={subject.id}
                      label={`${subject.subjectCode} - ${subject.subjectName}`}
                    >
                      <div className="class-form-option">
                        <span className="code">{subject.subjectCode}</span>
                        <span className="name">{subject.subjectName}</span>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="teacherId"
                label="Giảng viên"
                rules={[{ required: true, message: "Vui lòng chọn giảng viên!" }]}
              >
                <Select
                  placeholder="Chọn giảng viên"
                  showSearch
                  optionFilterProp="label"
                  optionLabelProp="label"
                  size="large"
                  loading={!teachers.length}
                >
                  {teachers.map((teacher) => (
                    <Option
                      key={teacher.id}
                      value={teacher.id}
                      label={`${teacher.teacherCode} - ${teacher.fullName}`}
                    >
                      <div className="class-form-option">
                        <span className="code">{teacher.teacherCode}</span>
                        <span className="name">{teacher.fullName}</span>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="maxEnrollment"
                label="Sĩ số tối đa"
                rules={[{ required: true, message: "Vui lòng nhập sĩ số tối đa!" }]}
              >
                <InputNumber
                  min={10}
                  max={500}
                  size="large"
                  style={{ width: "100%" }}
                  placeholder="Nhập số lượng"
                />
              </Form.Item>
            </div>
          </Form>
        ) : (
          <Descriptions
            bordered
            column={{ xxl: 4, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
            className="class-descriptions"
          >
            <Descriptions.Item
              label={
                <span>
                  <User size={16} /> Giảng viên
                </span>
              }
            >
              {classInfo.teacherName} ({classInfo.teacherCode})
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span>
                  <Calendar size={16} /> Kỳ học
                </span>
              }
            >
              <Tag color="blue">{classInfo.semesterName}</Tag>
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span>
                  <BookOpen size={16} /> Tín chỉ
                </span>
              }
            >
              {classInfo.credits}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span>
                  <Users size={16} /> Sĩ số
                </span>
              }
            >
              {classInfo.currentEnrollment} sinh viên
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span>
                  <UserPlus size={16} /> Số học sinh tối đa
                </span>
              }
            >
              {classInfo.maxEnrollment} lượt
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span>
                  <Inbox size={16} /> Chỗ trống
                </span>
              }
            >
              {classInfo.maxEnrollment - classInfo.currentEnrollment} chỗ
            </Descriptions.Item>
          </Descriptions>
        )}
      </Card>

      <Card className="students-card">
        <div className="students-header">
          <Title level={4} className="students-title">
            Danh sách sinh viên ({students.length})
          </Title>
        </div>
        <Table
          columns={columns}
          dataSource={students}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} sinh viên`,
            size: "small",
          }}
          scroll={{ x: 800 }}
          size="small"
        />
      </Card>

      <Card className="schedule-card">
        <div className="schedule-header">
          <div>
            <Title level={4} className="schedule-title">
              Lịch học
            </Title>
            <Text type="secondary">{scheduleSlots.length} buổi</Text>
          </div>
        </div>
        {slotsLoading ? (
          <div className="schedule-loading">
            <Spin />
          </div>
        ) : scheduleSlots.length === 0 ? (
          <Empty description="Chưa có lịch học" />
        ) : (
          <Table
            columns={[
              ...scheduleColumns,
              ...(isEditing
                ? [
                    {
                      title: "Hành động",
                      key: "actions",
                      width: 170,
                      render: (_: any, record: SlotDto) => (
                        <Space size="small">
                          <Button size="small" onClick={() => handleEditSlot(record)}>
                            Sửa
                          </Button>
                          <Button
                            size="small"
                            danger
                            onClick={() => handleDeleteSlot(record.id)}
                          >
                            Xóa
                          </Button>
                        </Space>
                      ),
                    },
                  ]
                : []),
            ]}
            dataSource={scheduleSlots}
            rowKey="id"
            pagination={{
              pageSize: 10,
              size: "small",
            }}
            size="small"
          />
        )}

        {isEditing && (
          <>
            <Divider />
            <Form form={slotForm} layout="vertical" className="additional-slot-form">
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="date"
                    label="Ngày học"
                    rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
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
                    <Select placeholder="Chọn ca học">
                      {timeSlots.map((slot) => (
                        <Option key={slot.id} value={slot.id}>
                          {slot.name} ({slot.startTime} - {slot.endTime})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="substituteTeacherId" label="GV thay thế">
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
                <Button type="primary" onClick={handleAddNewSlot}>
                  Thêm buổi học
                </Button>
              </Space>
            </Form>
          </>
        )}
      </Card>

      <Modal
        title="Chỉnh sửa buổi học"
        open={slotModalVisible}
        onCancel={() => {
          setSlotModalVisible(false);
          setSelectedSlot(null);
          editSlotForm.resetFields();
        }}
        onOk={handleUpdateSlot}
        confirmLoading={slotModalLoading}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnHidden
      >
        <Form form={editSlotForm} layout="vertical">
          <Form.Item
            name="date"
            label="Ngày học"
            rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item
            name="timeSlotId"
            label="Ca học"
            rules={[{ required: true, message: "Vui lòng chọn ca học" }]}
          >
            <Select placeholder="Chọn ca học" allowClear>
              {timeSlots.map((slot) => (
                <Option key={slot.id} value={slot.id}>
                  {slot.name} ({slot.startTime} - {slot.endTime})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="substituteTeacherId" label="GV thay thế">
            <Select placeholder="Chọn giảng viên" allowClear>
              {teachers.map((teacher) => (
                <Option key={teacher.id} value={teacher.id}>
                  {teacher.fullName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="substitutionReason" label="Lý do thay thế">
            <Input placeholder="Nhập lý do (nếu có)" />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <Input placeholder="Nhập ghi chú" />
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select placeholder="Chọn trạng thái">
              {SLOT_STATUS_OPTIONS.map((status) => (
                <Option key={status} value={status}>
                  {status}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Thêm sinh viên vào lớp"
        open={isAddStudentsModalOpen}
        onCancel={() => {
          setIsAddStudentsModalOpen(false);
          setSelectedStudentIds([]);
        }}
        width={900}
        footer={
          <Space>
            <Button
              onClick={() => {
                setIsAddStudentsModalOpen(false);
                setSelectedStudentIds([]);
              }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              disabled={selectedStudentIds.length === 0}
              loading={assigningStudents}
              onClick={handleAssignStudents}
            >
              Thêm sinh viên
            </Button>
          </Space>
        }
      >
        <Table
          columns={eligibleColumns}
          dataSource={eligibleStudents}
          rowKey={(record) => record.studentId || record.id || record.email}
          loading={eligibleLoading}
          rowSelection={{
            selectedRowKeys: selectedStudentIds,
            onChange: (keys) => setSelectedStudentIds(keys),
          }}
          pagination={{
            pageSize: 10,
            size: "small",
            showSizeChanger: false,
          }}
          locale={{
            emptyText: "Không có sinh viên đủ điều kiện",
          }}
          size="small"
        />
      </Modal>

      <Modal
        title="Danh sách đơn đăng ký chờ duyệt"
        open={isEnrollmentsModalOpen}
        onCancel={() => setIsEnrollmentsModalOpen(false)}
        footer={null}
        width={900}
      >
        <Table
          columns={enrollmentColumns}
          dataSource={enrollments}
          rowKey="id"
          loading={enrollmentsLoading}
          pagination={{
            pageSize: 10,
            size: "small",
          }}
          size="small"
        />
      </Modal>

      <Modal
        title="Lý do từ chối"
        open={rejectModal.visible}
        onOk={handleConfirmReject}
        onCancel={() => setRejectModal({ visible: false, id: null })}
        okText="Xác nhận từ chối"
        cancelText="Hủy"
      >
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Nhập lý do từ chối..."
          style={{ width: "100%", minHeight: 80 }}
        />
      </Modal>
    </div>
  );
};

export default ClassDetail;
