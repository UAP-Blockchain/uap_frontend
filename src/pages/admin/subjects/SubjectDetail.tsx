import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Descriptions,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  AppstoreOutlined,
  ArrowLeftOutlined,
  BookOutlined,
  CalendarOutlined,
  EditOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import type { SubjectDto, SubjectFormValues } from "../../../types/Subject";
import type { ClassSummary } from "../../../types/Class";
import {
  getSubjectByIdApi,
  updateSubjectApi,
  fetchSubjectsApi as fetchSubjectsOptionsApi,
  type CreateSubjectRequest,
} from "../../../services/admin/subjects/api";
import { fetchClassesApi } from "../../../services/admin/classes/api";
import {
  fetchGradeComponentsApi,
  createGradeComponentApi,
  updateGradeComponentApi,
  deleteGradeComponentApi,
} from "../../../services/admin/gradeComponents/api";
import type {
  GradeComponentDto,
  CreateGradeComponentRequest,
} from "../../../types/GradeComponent";
import "./SubjectDetail.scss";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const SubjectDetail: React.FC = () => {
  const navigate = useNavigate();
  const { subjectCode } = useParams<{ subjectCode: string }>();
  const [searchParams] = useSearchParams();
  const subjectId = searchParams.get("id");

  const [subject, setSubject] = useState<SubjectDto | null>(null);
  const [relatedClasses, setRelatedClasses] = useState<ClassSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [classesLoading, setClassesLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [prerequisiteOptions, setPrerequisiteOptions] = useState<SubjectDto[]>([]);
  const [loadingPrerequisites, setLoadingPrerequisites] = useState<boolean>(false);
  const [form] = Form.useForm<SubjectFormValues>();
  const [gradeComponents, setGradeComponents] = useState<GradeComponentDto[]>([]);
  const [gradeLoading, setGradeLoading] = useState<boolean>(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState<boolean>(false);
  const [gradeForm] = Form.useForm<Omit<CreateGradeComponentRequest, "subjectId">>();
  const [creatingGrade, setCreatingGrade] = useState<boolean>(false);
  const [editingGradeComponent, setEditingGradeComponent] = useState<GradeComponentDto | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [gradeToDelete, setGradeToDelete] = useState<GradeComponentDto | null>(null);
  const [deletingGrade, setDeletingGrade] = useState<boolean>(false);

  const prerequisiteList = useMemo(() => {
    if (!subject?.prerequisites) {
      return [] as string[];
    }
    return subject.prerequisites
      .split(/[;,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }, [subject?.prerequisites]);

  const classesStats = useMemo(() => {
    const totalClasses = relatedClasses.length;
    const totalStudents = relatedClasses.reduce(
      (sum, cls) => sum + (cls.totalStudents || 0),
      0
    );
    const totalEnrollments = relatedClasses.reduce(
      (sum, cls) => sum + (cls.totalEnrollments || 0),
      0
    );
    const totalSlots = relatedClasses.reduce(
      (sum, cls) => sum + (cls.totalSlots || 0),
      0
    );

    return {
      totalClasses,
      totalStudents,
      totalEnrollments,
      totalSlots,
    };
  }, [relatedClasses]);

  const loadSubjectDetail = useCallback(
    async (id: string, options?: { showLoading?: boolean }) => {
      const shouldShowPageLoading = options?.showLoading ?? true;

      if (shouldShowPageLoading) {
        setLoading(true);
      }
      setClassesLoading(true);
      try {
        const [subjectData, classesResponse] = await Promise.all([
          getSubjectByIdApi(id),
          fetchClassesApi(),
        ]);

        setSubject(subjectData);

        const classItems = classesResponse.items ?? [];

        const filteredClasses = classItems.filter(
          (cls) =>
            cls.subjectCode &&
            subjectData.subjectCode &&
            cls.subjectCode.toLowerCase() === subjectData.subjectCode.toLowerCase()
        );

        setRelatedClasses(filteredClasses);
      } catch {
        toast.error("Không thể tải thông tin môn học");
        navigate("/admin/subjects");
      } finally {
        if (shouldShowPageLoading) {
          setLoading(false);
        }
        setClassesLoading(false);
      }
    },
    [navigate]
  );

  const loadGradeComponents = useCallback(
    async (id: string) => {
      setGradeLoading(true);
      try {
        const data = await fetchGradeComponentsApi(id);
        setGradeComponents(data);
      } catch {
        toast.error("Không thể tải các thành phần điểm");
      } finally {
        setGradeLoading(false);
      }
    },
    []
  );

  const loadPrerequisiteOptions = useCallback(async () => {
    if (loadingPrerequisites) {
      return;
    }

    setLoadingPrerequisites(true);
    try {
      const response = await fetchSubjectsOptionsApi({
        pageNumber: 1,
        pageSize: 500,
      });
      setPrerequisiteOptions(response.data || []);
    } catch {
      toast.error("Không thể tải danh sách môn tiên quyết");
    } finally {
      setLoadingPrerequisites(false);
    }
  }, [loadingPrerequisites]);

  useEffect(() => {
    if (!subjectId) {
      toast.error("Không tìm thấy mã môn học");
      navigate("/admin/subjects");
      return;
    }

    loadSubjectDetail(subjectId);
    loadGradeComponents(subjectId);
  }, [subjectId, loadSubjectDetail, loadGradeComponents, navigate]);

  const handleStartEdit = () => {
    if (!subject) {
      return;
    }

    form.setFieldsValue({
      subjectCode: subject.subjectCode,
      subjectName: subject.subjectName,
      credits: subject.credits,
      description: subject.description,
      prerequisites: subject.prerequisites,
      department: subject.department,
      category: subject.category,
    });

    if (!prerequisiteOptions.length) {
      loadPrerequisiteOptions();
    }

    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (subject) {
      form.setFieldsValue({
        subjectCode: subject.subjectCode,
        subjectName: subject.subjectName,
        credits: subject.credits,
        description: subject.description,
        prerequisites: subject.prerequisites,
        department: subject.department,
        category: subject.category,
      });
    } else {
      form.resetFields();
    }
    setIsEditing(false);
  };

  const handleSubmitEdit = async (values: SubjectFormValues) => {
    if (!subject) {
      return;
    }

    const previousCode = subject.subjectCode;

    const payload: CreateSubjectRequest = {
      subjectCode: values.subjectCode.trim(),
      subjectName: values.subjectName.trim(),
      credits: values.credits,
      description: values.description?.trim() || undefined,
      department: values.department?.trim() || undefined,
      category: values.category?.trim() || undefined,
      prerequisites: values.prerequisites || undefined,
    };

    setIsSaving(true);
    try {
      const updated = await updateSubjectApi(subject.id, payload);
      toast.success("Cập nhật môn học thành công");
      setIsEditing(false);
      await loadSubjectDetail(updated.id, { showLoading: false });

      form.setFieldsValue({
        subjectCode: updated.subjectCode,
        subjectName: updated.subjectName,
        credits: updated.credits,
        description: updated.description,
        prerequisites: updated.prerequisites,
        department: updated.department,
        category: updated.category,
      });

      if (updated.subjectCode && updated.subjectCode !== previousCode) {
        navigate(`/admin/subjects/${updated.subjectCode}?id=${updated.id}`, {
          replace: true,
        });
      }
    } catch {
      toast.error("Không thể cập nhật môn học");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGradeFormSubmit = async (
    values: Omit<CreateGradeComponentRequest, "subjectId">
  ) => {
    if (!subject) {
      toast.error("Không tìm thấy môn học hiện tại");
      return;
    }

    const payload: CreateGradeComponentRequest = {
      subjectId: subject.id,
      ...values,
    };

    setCreatingGrade(true);
    try {
      if (editingGradeComponent) {
        const result = await updateGradeComponentApi(editingGradeComponent.id, payload);
        if (!result.success) {
          toast.error("Không thể lưu thay đổi thành phần điểm");
          return;
        }
        toast.success("Đã cập nhật thành phần điểm");
      } else {
        const result = await createGradeComponentApi(payload);
        if (!result.success) {
          toast.error("Không thể tạo thành phần điểm mới");
          return;
        }
        toast.success("Đã tạo thành phần điểm mới");
      }

      setIsGradeModalOpen(false);
      setEditingGradeComponent(null);
      gradeForm.resetFields();
      if (subject.id) {
        loadGradeComponents(subject.id);
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi thao tác với thành phần điểm");
    } finally {
      setCreatingGrade(false);
    }
  };

  const openDeleteGradeModal = (component: GradeComponentDto) => {
    setGradeToDelete(component);
    setDeleteModalOpen(true);
  };

  const closeDeleteGradeModal = () => {
    setDeleteModalOpen(false);
    setGradeToDelete(null);
  };

  const handleDeleteGradeComponent = async () => {
    if (!subject || !gradeToDelete) {
      toast.error("Không tìm thấy thông tin để xóa");
      return;
    }

    setDeletingGrade(true);
    try {
      const result = await deleteGradeComponentApi(gradeToDelete.id);
      if (!result.success) {
        toast.error("Không thể xóa thành phần điểm");
        return;
      }
      toast.success("Đã xóa thành phần điểm");
      await loadGradeComponents(subject.id);
      closeDeleteGradeModal();
    } catch {
      toast.error("Không thể xóa thành phần điểm");
    } finally {
      setDeletingGrade(false);
    }
  };

  const openCreateGradeModal = () => {
    setEditingGradeComponent(null);
    gradeForm.resetFields();
    setIsGradeModalOpen(true);
  };

  const openEditGradeModal = (component: GradeComponentDto) => {
    gradeForm.setFieldsValue({
      name: component.name,
      weightPercent: component.weightPercent,
    });
    setEditingGradeComponent(component);
    setIsGradeModalOpen(true);
  };

  const closeGradeModal = () => {
    setIsGradeModalOpen(false);
    setEditingGradeComponent(null);
    gradeForm.resetFields();
  };

  const classColumns: ColumnsType<ClassSummary> = useMemo(
    () => [
      {
        title: "Mã lớp",
        dataIndex: "classCode",
        key: "classCode",
        width: 140,
        render: (code: string, record) => (
          <Button
            type="link"
            onClick={() =>
              navigate(`/admin/classes/${record.classCode}?id=${record.id}`)
            }
          >
            {code}
          </Button>
        ),
      },
      {
        title: "Giảng viên",
        dataIndex: "teacherName",
        key: "teacherName",
        width: 200,
        render: (teacherName: string) => teacherName || "Chưa cập nhật",
      },
      {
        title: "Kỳ học",
        dataIndex: "semesterName",
        key: "semesterName",
        width: 150,
        render: (semester?: string) => (
          <Tag color="blue" className="semester-tag">
            {semester || "Chưa cập nhật"}
          </Tag>
        ),
      },
      {
        title: "Tín chỉ",
        dataIndex: "credits",
        key: "credits",
        width: 100,
        align: "center",
        render: (credits: number) => (
          <Tag color="purple" className="credit-tag">
            {credits}
          </Tag>
        ),
      },
      {
        title: "Sĩ số",
        dataIndex: "currentEnrollment",
        key: "totalStudents",
        width: 110,
        align: "center",
        render: (value?: number) => value ?? 0,
      },
      {
        title: "Đăng ký",
        dataIndex: "totalEnrollments",
        key: "totalEnrollments",
        width: 110,
        align: "center",
        render: (value?: number) => value ?? 0,
      },
      {
        title: "Chỗ trống",
        dataIndex: "totalSlots",
        key: "totalSlots",
        width: 110,
        align: "center",
        render: (_: number, record: ClassSummary) => {
          if (typeof record.maxEnrollment === "number" && typeof record.currentEnrollment === "number") {
            return Math.max(record.maxEnrollment - record.currentEnrollment, 0);
          }
          return 0;
        },
      },
    ],
    [navigate]
  );

  const gradeComponentColumns: ColumnsType<GradeComponentDto> = [
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Trọng số",
      dataIndex: "weightPercent",
      key: "weightPercent",
      align: "center",
      render: (value: number) => `${value}%`,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 170,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button type="link" onClick={() => openEditGradeModal(record)}>
            Sửa
          </Button>
          <Button type="link" danger onClick={() => openDeleteGradeModal(record)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const totalGradeWeight = useMemo(
    () => gradeComponents.reduce((sum, component) => sum + component.weightPercent, 0),
    [gradeComponents]
  );

  if (loading) {
    return (
      <div className="subject-detail">
        <div className="subject-detail-loading">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!subject) {
    return null;
  }

  return (
    <div className="subject-detail">
      <div className="subject-detail-header">
        <div className="header-left">
          <Button
            className="back-button"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>
          <div>
            <Title level={3} className="page-title">
              {subject.subjectName}
            </Title>
            <Text type="secondary">{subject.subjectCode || subjectCode}</Text>
          </div>
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
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleStartEdit}
              disabled={!subject}
            >
              Chỉnh sửa
            </Button>
          )}
        </div>
      </div>

      <Card className={`subject-info-card${isEditing ? " editing" : ""}`}>
        <div className="subject-info-header">
          <div className="subject-icon-wrapper">
            <BookOutlined />
          </div>
          <div className="subject-info-content">
            <Title level={4} className="subject-name">
              {subject.subjectName}
            </Title>
            <Text className="subject-meta">
              Mã môn học: <strong>{subject.subjectCode}</strong>
            </Text>
          </div>
          <div className="subject-stats">
            <div className="stat-chip total">
              <BookOutlined />
              <div>
                <Text className="value">{classesStats.totalClasses}</Text>
                <Text className="label">Lớp đang mở</Text>
              </div>
            </div>
          </div>
        </div>

        {isEditing ? (
          <Form
            form={form}
            layout="vertical"
            className="subject-edit-form"
            onFinish={handleSubmitEdit}
          >
            <div className="subject-form-grid">
              <Form.Item
                name="subjectCode"
                label="Mã môn học"
                rules={[{ required: true, message: "Vui lòng nhập mã môn học!" }]}
              >
                <Input placeholder="VD: AI401, BC202..." size="large" />
              </Form.Item>
              <Form.Item
                name="subjectName"
                label="Tên môn học"
                rules={[{ required: true, message: "Vui lòng nhập tên môn học!" }]}
              >
                <Input placeholder="Nhập tên môn học" size="large" />
              </Form.Item>
            </div>

            <div className="subject-form-grid">
              <Form.Item
                name="credits"
                label="Số tín chỉ"
                rules={[
                  { required: true, message: "Vui lòng nhập số tín chỉ!" },
                  { type: "number", min: 1, message: "Số tín chỉ phải lớn hơn 0!" },
                ]}
              >
                <InputNumber
                  min={1}
                  max={10}
                  placeholder="Nhập số tín chỉ"
                  style={{ width: "100%" }}
                  size="large"
                />
              </Form.Item>
              <Form.Item name="department" label="Bộ môn">
                <Input placeholder="Nhập tên bộ môn" size="large" />
              </Form.Item>
            </div>

            <div className="subject-form-grid">
              <Form.Item name="category" label="Phân loại">
                <Input placeholder="Nhập phân loại (nếu có)" size="large" />
              </Form.Item>
              <Form.Item
                name="prerequisites"
                label="Môn tiên quyết"
                extra="Chọn mã môn học phải hoàn thành trước (ví dụ: CS101). Bỏ trống nếu không có."
                className="full-width"
              >
                <Select
                  placeholder="Chọn môn tiên quyết"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  size="large"
                  onDropdownVisibleChange={(open) => {
                    if (open && !prerequisiteOptions.length) {
                      loadPrerequisiteOptions();
                    }
                  }}
                  notFoundContent={
                    loadingPrerequisites ? <Spin size="small" /> : "Không có dữ liệu"
                  }
                  className="subject-form-select"
                >
                  {prerequisiteOptions
                    .filter((item) => !subject || item.id !== subject.id)
                    .map((item) => (
                      <Option
                        key={item.id}
                        value={item.subjectCode}
                        label={`${item.subjectCode} - ${item.subjectName}`}
                      >
                        <div className="subject-form-option">
                          <span className="code">{item.subjectCode}</span>
                          <span className="name">{item.subjectName}</span>
                        </div>
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </div>

            <Form.Item name="description" label="Mô tả">
              <Input.TextArea
                rows={3}
                placeholder="Nhập mô tả ngắn về môn học"
                autoSize={{ minRows: 3, maxRows: 4 }}
              />
            </Form.Item>
          </Form>
        ) : (
          <Descriptions
            column={{ xs: 1, sm: 1, md: 2 }}
            bordered
            size="small"
            className="subject-descriptions"
          >
            <Descriptions.Item label="Bộ môn">
              {subject.department || "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item label="Phân loại">
              {subject.category || "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng lớp mở">
              {subject.totalOfferings ?? classesStats.totalClasses}
            </Descriptions.Item>
            <Descriptions.Item label="Tín chỉ">
              {subject.credits}
            </Descriptions.Item>
            <Descriptions.Item label="Môn tiên quyết" span={2}>
              {prerequisiteList.length ? (
                <Space wrap>
                  {prerequisiteList.map((item) => (
                    <Tag key={item} color="orange">
                      {item}
                    </Tag>
                  ))}
                </Space>
              ) : (
                <Tag color="default">Không có</Tag>
              )}
            </Descriptions.Item>
            {subject.description && (
              <Descriptions.Item label="Mô tả" span={2}>
                <Paragraph className="subject-description">
                  {subject.description}
                </Paragraph>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Card>

      <Card className="classes-card">
        <div className="classes-header">
          <Title level={4} className="classes-title">
            Danh sách lớp mở theo môn học
          </Title>
          <Text type="secondary">
            Các lớp hiện hành liên quan đến {subject.subjectCode}
          </Text>
        </div>
        <Table
          columns={classColumns}
          dataSource={relatedClasses}
          rowKey="id"
          loading={classesLoading}
          pagination={false}
          locale={{
            emptyText: classesLoading ? <Spin size="small" /> : <Empty description="Chưa có lớp cho môn học này" />,
          }}
          size="small"
        />
      </Card>

      <Card className="grade-components-card">
        <div className="grade-components-header">
          <Title level={4} className="classes-title">
            Thành phần điểm
          </Title>
          <Button type="primary" onClick={openCreateGradeModal}>
            Thêm thành phần điểm
          </Button>
        </div>
        <Table
          columns={gradeComponentColumns}
          dataSource={gradeComponents}
          rowKey="id"
          loading={gradeLoading}
          pagination={false}
          locale={{
            emptyText: gradeLoading ? <Spin size="small" /> : "Chưa có thành phần điểm",
          }}
          size="small"
        />
        {totalGradeWeight !== 100 && (
          <div className="grade-weight-warning">
            <Text type="warning">
              Trọng số hiện tại là {totalGradeWeight}%. Tổng trọng số phải bằng 100%.
            </Text>
          </div>
        )}
      </Card>

        <Modal
          title={editingGradeComponent ? "Chỉnh sửa thành phần điểm" : "Thêm thành phần điểm"}
          open={isGradeModalOpen}
          onCancel={closeGradeModal}
          onOk={() => gradeForm.submit()}
          okText={editingGradeComponent ? "Lưu" : "Tạo"}
          cancelText="Hủy"
          confirmLoading={creatingGrade}
          destroyOnClose
        >
          <Form
            form={gradeForm}
            layout="vertical"
            onFinish={handleGradeFormSubmit}
          >
            <Form.Item
              name="name"
              label="Tên thành phần"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            >
              <Input placeholder="Ví dụ: Bài tập giữa kì" />
            </Form.Item>
            <Form.Item
              name="weightPercent"
              label="Trọng số (%)"
              rules={[
                { required: true, message: "Vui lòng nhập trọng số" },
                { type: "number", min: 1, message: "Phải lớn hơn 0" },
              ]}
            >
              <InputNumber style={{ width: "100%" }} min={1} max={100} />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Xóa thành phần điểm"
          open={deleteModalOpen}
          onCancel={closeDeleteGradeModal}
          onOk={handleDeleteGradeComponent}
          okText="Xóa"
          okType="danger"
          cancelText="Hủy"
          confirmLoading={deletingGrade}
        >
          <p>
            Bạn có chắc chắn muốn xóa thành phần điểm
            {" "}
            <strong>{gradeToDelete?.name ?? "này"}</strong>
            {" "}với trọng số{gradeToDelete ? ` ${gradeToDelete.weightPercent}%` : ""} không?
          </p>
          <p className="delete-warning-text">
            Hành động này không thể hoàn tác.
          </p>
        </Modal>

    </div>
  );
};

export default SubjectDetail;
