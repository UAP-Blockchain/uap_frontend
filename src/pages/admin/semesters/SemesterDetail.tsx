import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  DatePicker,
  Space,
  Tag,
  Typography,
  Spin,
  Modal,
  Row,
  Col,
} from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  XCircle,
  BookOpen,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  activeSemesterApi,
  closeSemesterApi,
  getSemesterByIdApi,
  updateSemesterApi,
} from "../../../services/admin/semesters/api";
import type { SemesterDto } from "../../../types/Semester";
import "./SemesterDetail.scss";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

type SemesterFormValues = {
  name: string;
  dateRange: [Dayjs, Dayjs];
};

type StatusAction = "activate" | "close" | null;

const SemesterDetail: React.FC = () => {
  const { semesterId } = useParams<{ semesterId: string }>();
  const navigate = useNavigate();
  const [semester, setSemester] = useState<SemesterDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusAction, setStatusAction] = useState<StatusAction>(null);
  const [form] = Form.useForm<SemesterFormValues>();

  const setFormValues = useCallback(
    (info: SemesterDto) => {
      form.setFieldsValue({
        name: info.name,
        dateRange: [dayjs(info.startDate), dayjs(info.endDate)],
      });
    },
    [form]
  );

  const loadSemester = useCallback(
    async (id: string, options?: { showLoading?: boolean }) => {
      const shouldShowLoading = options?.showLoading ?? true;
      if (shouldShowLoading) {
        setLoading(true);
      }
      try {
        const data = await getSemesterByIdApi(id);
        setSemester(data);
        setFormValues(data);
      } catch {
        toast.error("Không thể tải thông tin học kỳ");
        navigate("/admin/semesters");
      } finally {
        if (shouldShowLoading) {
          setLoading(false);
        }
      }
    },
    [navigate, setFormValues]
  );

  useEffect(() => {
    if (!semesterId) {
      toast.error("Không tìm thấy học kỳ");
      navigate("/admin/semesters");
      return;
    }

    loadSemester(semesterId);
  }, [semesterId, loadSemester, navigate]);

  const handleStartEdit = () => {
    if (!semester) {
      return;
    }
    setFormValues(semester);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (semester) {
      setFormValues(semester);
    } else {
      form.resetFields();
    }
    setIsEditing(false);
  };

  const handleSubmit = async (values: SemesterFormValues) => {
    if (!semester || !semesterId) {
      return;
    }

    const [startDate, endDate] = values.dateRange;
    if (!startDate || !endDate) {
      toast.error("Vui lòng chọn thời gian học kỳ");
      return;
    }

    if (endDate.isBefore(startDate)) {
      toast.error("Ngày kết thúc phải sau ngày bắt đầu");
      return;
    }

    const payload = {
      name: values.name.trim(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    setIsSaving(true);
    try {
      await updateSemesterApi(semesterId, payload);
      toast.success("Cập nhật học kỳ thành công");
      setIsEditing(false);
      await loadSemester(semesterId, { showLoading: false });
    } catch {
      toast.error("Không thể cập nhật học kỳ");
    } finally {
      setIsSaving(false);
    }
  };

  const performStatusChange = async (action: Exclude<StatusAction, null>) => {
    if (!semesterId) {
      return;
    }
    setStatusAction(action);
    try {
      if (action === "activate") {
        await activeSemesterApi(semesterId);
        toast.success("Đã kích hoạt học kỳ");
      } else {
        await closeSemesterApi(semesterId);
        toast.success("Đã đóng học kỳ");
      }
      await loadSemester(semesterId, { showLoading: false });
    } catch {
      toast.error("Không thể cập nhật trạng thái học kỳ");
    } finally {
      setStatusAction(null);
    }
  };

  const confirmStatusChange = (action: Exclude<StatusAction, null>) => {
    if (!semester) {
      return;
    }

    if (action === "activate" && (semester.isActive || semester.isClosed)) {
      toast.warning("Học kỳ hiện không thể kích hoạt");
      return;
    }

    if (action === "close" && semester.isClosed) {
      toast.warning("Học kỳ đã được đóng");
      return;
    }

    const messages =
      action === "activate"
        ? {
            title: "Kích hoạt học kỳ",
            content: "Bạn có chắc muốn kích hoạt học kỳ này?",
            okText: "Kích hoạt",
          }
        : {
            title: "Đóng học kỳ",
            content:
              "Bạn có chắc muốn đóng học kỳ này? Hành động này không thể hoàn tác.",
            okText: "Đóng học kỳ",
          };

    Modal.confirm({
      ...messages,
      cancelText: "Hủy",
      onOk: () => performStatusChange(action),
    });
  };

  const statusInfo = useMemo(() => {
    if (!semester) {
      return null;
    }
    if (semester.isClosed) {
      return {
        color: "default" as const,
        label: "Đã đóng",
        icon: <XCircle size={16} />,
      };
    }
    if (semester.isActive) {
      return {
        color: "success" as const,
        label: "Đang hoạt động",
        icon: <CheckCircle size={16} />,
      };
    }
    return {
      color: "warning" as const,
      label: "Chưa kích hoạt",
      icon: <Clock size={16} />,
    };
  }, [semester]);

  const durationText = useMemo(() => {
    if (!semester) {
      return "-";
    }
    const start = dayjs(semester.startDate);
    const end = dayjs(semester.endDate);
    const days = end.diff(start, "day");
    if (!Number.isFinite(days)) {
      return "-";
    }
    return `${days} ngày`;
  }, [semester]);

  if (loading) {
    return (
      <div className="semester-detail-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!semester) {
    return null;
  }

  return (
    <div className="semester-detail">
      <div className="semester-detail-header">
        <div className="header-left">
          <Button
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate("/admin/semesters")}
            className="back-button"
          >
            Quay lại
          </Button>
          <Title level={2} className="page-title">
            Chi tiết học kỳ
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
        </div>
      </div>

      <Row gutter={16} className="semester-overview-row">
        <Col xs={24}>
          <Card className={`semester-info-card${isEditing ? " editing" : ""}`}>
            <div className="semester-info-header">
              <div className="icon-wrapper">
                <CalendarIcon size={24} />
              </div>
              <div>
                <Title level={3} className="semester-name">
                  {semester.name}
                </Title>
                <Text className="semester-duration">
                  <Clock size={14} /> {durationText}
                </Text>
              </div>
            </div>

            {isEditing ? (
              <Form
                form={form}
                layout="vertical"
                className="semester-edit-form"
                onFinish={handleSubmit}
              >
                <Form.Item
                  name="name"
                  label="Tên học kỳ"
                  rules={[{ required: true, message: "Vui lòng nhập tên học kỳ!" }]}
                >
                  <Input placeholder="Nhập tên học kỳ" size="large" />
                </Form.Item>
                <Form.Item
                  name="dateRange"
                  label="Thời gian học kỳ"
                  rules={[{ required: true, message: "Vui lòng chọn thời gian học kỳ!" }]}
                >
                  <RangePicker
                    size="large"
                    format="DD/MM/YYYY"
                    style={{ width: "100%" }}
                    placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
                  />
                </Form.Item>
              </Form>
            ) : (
              <Descriptions
                bordered
                column={1}
                className="semester-descriptions"
              >
                <Descriptions.Item
                  label={
                    <span>
                      <CalendarIcon size={16} /> Ngày bắt đầu
                    </span>
                  }
                >
                  {dayjs(semester.startDate).format("DD/MM/YYYY")}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <span>
                      <CalendarIcon size={16} /> Ngày kết thúc
                    </span>
                  }
                >
                  {dayjs(semester.endDate).format("DD/MM/YYYY")}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <span>
                      <BookOpen size={16} /> Tổng môn học
                    </span>
                  }
                >
                  {semester.totalSubjects}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <span>
                      <CheckCircle size={16} /> Trạng thái
                    </span>
                  }
                >
                  {statusInfo ? (
                    <Tag
                      color={statusInfo.color}
                      icon={statusInfo.icon}
                      className="status-tag"
                    >
                      {statusInfo.label}
                    </Tag>
                  ) : (
                    "-"
                  )}
                </Descriptions.Item>
              </Descriptions>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SemesterDetail;
