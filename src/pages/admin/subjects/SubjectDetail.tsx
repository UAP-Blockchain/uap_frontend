import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  ArrowLeftOutlined,
  BookOutlined,
  EditOutlined,
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
  fetchGradeComponentTreeApi,
  createSubjectGradeComponentsApi,
} from "../../../services/admin/gradeComponents/api";
import type {
  GradeComponentDto,
  CreateSubjectGradeComponentsRequest,
} from "../../../types/GradeComponent";
import type { SpecializationDto } from "../../../types/Specialization";
import { fetchSpecializationsApi } from "../../../services/admin/specializations/api";
import "./SubjectDetail.scss";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface GradeComponentFormNode {
  name: string;
  weightPercent: number;
  /**
   * Số lượng thành phần con tự động sinh (Mini Test 1, 2, 3, ...)
   */
  childCount?: number;
}

interface GradeConfigFormValues {
  components: GradeComponentFormNode[];
}

const mapDtoToFormNode = (node: GradeComponentDto): GradeComponentFormNode => ({
  name: node.name,
  weightPercent: node.weightPercent,
  childCount: node.subComponents?.length ?? 0,
});

const mapFormNodeToCreateItem = (
  node: GradeComponentFormNode
): CreateSubjectGradeComponentsRequest["components"][number] => {
  const name = node.name.trim();
  const weightPercent = Number(node.weightPercent) || 0;
  const childCount =
    node.childCount && node.childCount > 0 ? node.childCount : 0;

  if (!childCount) {
    return {
      name,
      weightPercent,
      subComponents: [],
    };
  }

  // Chia đều trọng số cho các thành phần con, đảm bảo tổng đúng bằng trọng số cha
  const base = Math.floor(weightPercent / childCount);
  const remainder = weightPercent - base * childCount;

  const subComponents = Array.from({ length: childCount }, (_, index) => {
    const extra = index < remainder ? 1 : 0;
    return {
      name: `${name} ${index + 1}`,
      weightPercent: base + extra,
      subComponents: [] as never[],
    };
  });

  return {
    name,
    weightPercent,
    subComponents,
  };
};

const hasGradesInNode = (node: GradeComponentDto): boolean =>
  (node.gradeCount ?? 0) > 0 ||
  (node.subComponents?.some((child) => hasGradesInNode(child)) ?? false);

const SubjectDetail: React.FC = () => {
  const navigate = useNavigate();
  // subjectCode param not needed here because we load subject by id from query string
  useParams<{ subjectCode: string }>();
  const [searchParams] = useSearchParams();
  const subjectId = searchParams.get("id");

  const [subject, setSubject] = useState<SubjectDto | null>(null);
  const [relatedClasses, setRelatedClasses] = useState<ClassSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [classesLoading, setClassesLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [prerequisiteOptions, setPrerequisiteOptions] = useState<SubjectDto[]>(
    []
  );
  const [loadingPrerequisites, setLoadingPrerequisites] =
    useState<boolean>(false);
  const [specializations, setSpecializations] = useState<SpecializationDto[]>(
    []
  );
  const [specializationsLoading, setSpecializationsLoading] =
    useState<boolean>(false);
  const [specializationsError, setSpecializationsError] = useState<
    string | null
  >(null);
  const [form] = Form.useForm<SubjectFormValues>();
  const [gradeComponents, setGradeComponents] = useState<GradeComponentDto[]>(
    []
  );
  const [gradeLoading, setGradeLoading] = useState<boolean>(false);
  const [isGradeConfigModalOpen, setIsGradeConfigModalOpen] =
    useState<boolean>(false);
  const [gradeConfigForm] = Form.useForm<GradeConfigFormValues>();
  const [savingGradeConfig, setSavingGradeConfig] = useState<boolean>(false);
  const hasLoadedGradeTreeRef = useRef(false);

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
            cls.subjectCode.toLowerCase() ===
              subjectData.subjectCode.toLowerCase()
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

  const loadGradeComponents = useCallback(async (id: string) => {
    setGradeLoading(true);
    try {
      const data = await fetchGradeComponentTreeApi(id);
      setGradeComponents(data || []);
    } catch {
      // Nếu backend lỗi (500, 404, ...) interceptor sẽ hiển thị thông báo chung.
      // Ở đây chỉ đảm bảo UI vẫn hoạt động.
      setGradeComponents([]);
    } finally {
      setGradeLoading(false);
    }
  }, []);

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

  const loadSpecializations = useCallback(async () => {
    if (specializationsLoading) {
      return;
    }

    setSpecializationsLoading(true);
    setSpecializationsError(null);
    try {
      const response = await fetchSpecializationsApi({
        pageNumber: 1,
        pageSize: 200,
        isActive: true,
      });
      setSpecializations(response.data || []);
    } catch (error) {
      console.error("Failed to load specializations:", error);
      setSpecializationsError(
        "Không thể tải danh sách chuyên ngành. Vui lòng thử lại sau."
      );
      toast.error("Không thể tải danh sách chuyên ngành");
    } finally {
      setSpecializationsLoading(false);
    }
  }, [specializationsLoading]);

  const specializationOptions = useMemo(
    () =>
      specializations.map((spec) => ({
        label: `${spec.code} - ${spec.name}`,
        value: spec.id,
      })),
    [specializations]
  );

  useEffect(() => {
    if (!subjectId) {
      toast.error("Không tìm thấy mã môn học");
      navigate("/admin/subjects");
      return;
    }

    // Tránh gọi tree API 2 lần trong môi trường dev (React StrictMode)
    if (!hasLoadedGradeTreeRef.current) {
      hasLoadedGradeTreeRef.current = true;
      loadSubjectDetail(subjectId);
      loadGradeComponents(subjectId);
      loadSpecializations();
    } else {
      // Lần render thứ hai chỉ cần reload lại thông tin môn (nhẹ hơn), không cần gọi tree nữa
      loadSubjectDetail(subjectId, { showLoading: false });
    }
  }, [
    subjectId,
    loadSubjectDetail,
    loadGradeComponents,
    loadSpecializations,
    navigate,
  ]);

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
      specializationIds: subject.specializations?.map((s) => s.id) || [],
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
      specializationIds: values.specializationIds || [],
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
        specializationIds: updated.specializations?.map((s) => s.id) || [],
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

  const handleOpenGradeConfig = () => {
    if (!subject) {
      toast.error("Không tìm thấy môn học hiện tại");
      return;
    }

    if (gradeComponents.length) {
      gradeConfigForm.setFieldsValue({
        components: gradeComponents.map(mapDtoToFormNode),
      });
    } else {
      // Gợi ý mặc định khi chưa có cấu hình
      gradeConfigForm.setFieldsValue({
        components: [
          { name: "Giữa kỳ", weightPercent: 40 },
          { name: "Cuối kỳ", weightPercent: 60 },
        ],
      });
    }

    setIsGradeConfigModalOpen(true);
  };

  const handleCloseGradeConfig = () => {
    setIsGradeConfigModalOpen(false);
  };

  const validateGradeTree = (
    components: GradeComponentFormNode[]
  ): string | null => {
    const normalize = (value: number | undefined) =>
      Number.isFinite(value) ? Number(value) : 0;

    const totalRoot = components.reduce(
      (sum, item) => sum + normalize(item.weightPercent),
      0
    );

    if (totalRoot !== 100) {
      return `Tổng trọng số toàn bộ thang điểm phải bằng 100% (hiện tại: ${totalRoot}%).`;
    }

    return null;
  };

  const handleSubmitGradeConfig = async (values: GradeConfigFormValues) => {
    if (!subject) {
      toast.error("Không tìm thấy môn học hiện tại");
      return;
    }

    const components = values.components || [];

    if (!components.length) {
      toast.error("Vui lòng thêm ít nhất một thành phần điểm");
      return;
    }

    const validationError = validateGradeTree(components);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const payload: CreateSubjectGradeComponentsRequest = {
      subjectId: subject.id,
      components: components.map(mapFormNodeToCreateItem),
    };

    setSavingGradeConfig(true);
    try {
      await createSubjectGradeComponentsApi(payload);
      toast.success("Thiết lập thang điểm thành công");
      setIsGradeConfigModalOpen(false);
      await loadGradeComponents(subject.id);
    } catch (error) {
      const anyError = error as { response?: { data?: { message?: string } } };
      const message =
        anyError.response?.data?.message ||
        "Không thể thiết lập thang điểm. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setSavingGradeConfig(false);
    }
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
          if (
            typeof record.maxEnrollment === "number" &&
            typeof record.currentEnrollment === "number"
          ) {
            return Math.max(record.maxEnrollment - record.currentEnrollment, 0);
          }
          return 0;
        },
      },
    ],
    [navigate]
  );

  const gradeComponentColumns: ColumnsType<
    GradeComponentDto & { children?: GradeComponentDto[] }
  > = useMemo(
    () => [
      {
        title: "Thành phần",
        dataIndex: "name",
        key: "name",
        render: (name: string, record) => (
          <span
            className={
              record.parentId
                ? "grade-component-name child"
                : "grade-component-name"
            }
          >
            {record.parentId && <span className="child-prefix">↳</span>}
            {name}
          </span>
        ),
      },
      {
        title: "Trọng số (%)",
        dataIndex: "weightPercent",
        key: "weightPercent",
        align: "center" as const,
        render: (value: number, record) => (
          <span
            className={
              record.parentId
                ? "grade-weight-value child"
                : "grade-weight-value"
            }
          >
            {value}%
          </span>
        ),
      },
    ],
    []
  );

  const gradeTableData: (GradeComponentDto & {
    children?: GradeComponentDto[];
  })[] = useMemo(() => {
    const mapNode = (
      node: GradeComponentDto
    ): GradeComponentDto & { children?: GradeComponentDto[] } => ({
      ...node,
      children: node.subComponents?.map(mapNode),
    });

    return gradeComponents.map(mapNode);
  }, [gradeComponents]);

  const hasAnyGrades = useMemo(
    () => gradeComponents.some((component) => hasGradesInNode(component)),
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
              Chi tiết môn học
            </Title>
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
            <Form.Item
              name="specializationIds"
              label="Chuyên ngành"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ít nhất 1 chuyên ngành!",
                },
              ]}
              extra={specializationsError || undefined}
            >
              <Select
                mode="multiple"
                placeholder={
                  specializationsLoading
                    ? "Đang tải chuyên ngành..."
                    : "Chọn chuyên ngành (có thể chọn nhiều)"
                }
                loading={specializationsLoading}
                options={specializationOptions}
                showSearch
                optionFilterProp="label"
                allowClear
                disabled={!specializations.length}
                size="large"
                onDropdownVisibleChange={(open) => {
                  if (open && !specializations.length) {
                    loadSpecializations();
                  }
                }}
              />
            </Form.Item>

            <div className="subject-form-grid">
              <Form.Item
                name="subjectCode"
                label="Mã môn học"
                rules={[
                  { required: true, message: "Vui lòng nhập mã môn học!" },
                ]}
              >
                <Input placeholder="VD: AI401, BC202..." size="large" />
              </Form.Item>
              <Form.Item
                name="subjectName"
                label="Tên môn học"
                rules={[
                  { required: true, message: "Vui lòng nhập tên môn học!" },
                ]}
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
                  {
                    type: "number",
                    min: 1,
                    message: "Số tín chỉ phải lớn hơn 0!",
                  },
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
              <Form.Item
                name="department"
                label="Bộ môn (tùy chọn)"
              >
                <Input placeholder="Nhập bộ môn/khoa (tùy chọn)" size="large" />
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
                    loadingPrerequisites ? (
                      <Spin size="small" />
                    ) : (
                      "Không có dữ liệu"
                    )
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
            <Descriptions.Item label="Chuyên ngành">
              {subject.specializations && subject.specializations.length > 0 ? (
                <Space wrap>
                  {subject.specializations.map((spec) => (
                    <Tag key={spec.id} color="blue">
                      {spec.code} - {spec.name}
                    </Tag>
                  ))}
                </Space>
              ) : subject.department ? (
                <Tag color="default">{subject.department}</Tag>
              ) : (
                "Chưa cập nhật"
              )}
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
            emptyText: classesLoading ? (
              <Spin size="small" />
            ) : (
              <Empty description="Chưa có lớp cho môn học này" />
            ),
          }}
          size="small"
        />
      </Card>

      <Card className="grade-components-card">
        <div className="grade-components-header">
          <Title level={4} className="classes-title">
            Cấu hình thang điểm
          </Title>
          <Button
            type="primary"
            onClick={handleOpenGradeConfig}
            disabled={gradeLoading}
          >
            {gradeComponents.length
              ? "Chỉnh sửa thang điểm"
              : "Thiết lập thang điểm"}
          </Button>
        </div>

        {hasAnyGrades && (
          <div className="grade-info-banner">
            <Text type="secondary">
              Môn học đã có điểm được nhập. Thang điểm hiện tại chỉ có thể xem,
              không thể chỉnh sửa.
            </Text>
          </div>
        )}

        <Table
          columns={gradeComponentColumns}
          dataSource={gradeTableData}
          rowKey="id"
          loading={gradeLoading}
          pagination={false}
          size="small"
          expandable={{ defaultExpandAllRows: true }}
          locale={{
            emptyText: gradeLoading ? (
              <Spin size="small" />
            ) : (
              "Chưa cấu hình thang điểm cho môn học này"
            ),
          }}
        />
      </Card>

      <Modal
        title="Thiết lập thang điểm cho môn học"
        open={isGradeConfigModalOpen}
        onCancel={handleCloseGradeConfig}
        onOk={() => gradeConfigForm.submit()}
        okText="Lưu thang điểm"
        cancelText="Hủy"
        confirmLoading={savingGradeConfig}
        width={800}
        destroyOnClose
      >
        <Form
          form={gradeConfigForm}
          layout="vertical"
          onFinish={handleSubmitGradeConfig}
        >
          <Text type="secondary">
            Thiết lập cấu trúc thang điểm cho môn học. Tổng trọng số các thành
            phần cấp 1 phải bằng 100%, và tổng trọng số các thành phần con phải
            bằng trọng số của thành phần cha.
          </Text>

          <Form.List name="components">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Card
                    key={field.key}
                    size="small"
                    className="grade-config-item"
                    title={`Thành phần ${index + 1}`}
                    extra={
                      fields.length > 1 ? (
                        <Button
                          danger
                          type="link"
                          onClick={() => remove(field.name)}
                        >
                          Xóa
                        </Button>
                      ) : null
                    }
                    style={{ marginBottom: 12 }}
                  >
                    <div className="subject-form-grid">
                      <Form.Item
                        name={[field.name, "name"]}
                        label="Tên thành phần"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập tên thành phần",
                          },
                        ]}
                      >
                        <Input placeholder="Ví dụ: Giữa kỳ, Cuối kỳ, Bài tập, Dự án..." />
                      </Form.Item>
                      <Form.Item
                        name={[field.name, "weightPercent"]}
                        label="Trọng số (%)"
                        rules={[
                          { required: true, message: "Vui lòng nhập trọng số" },
                          {
                            type: "number",
                            min: 0,
                            max: 100,
                            message: "0 - 100",
                          },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          min={0}
                          max={100}
                        />
                      </Form.Item>
                    </div>

                    <div className="subject-form-grid">
                      <Form.Item
                        name={[field.name, "childCount"]}
                        label="Số lượng thành phần con"
                        rules={[
                          {
                            type: "number",
                            min: 0,
                            max: 20,
                            message: "0 - 20",
                          },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          min={0}
                          max={20}
                          placeholder="Ví dụ: 2 (Mini Test 1, Mini Test 2)"
                        />
                      </Form.Item>
                    </div>

                    <Form.Item noStyle shouldUpdate>
                      {({ getFieldValue }) => {
                        const componentValue = getFieldValue([
                          "components",
                          field.name,
                        ]) as GradeComponentFormNode | undefined;

                        const name = (componentValue?.name || "").trim();
                        const weight =
                          Number(componentValue?.weightPercent) || 0;
                        const count =
                          componentValue?.childCount &&
                          componentValue.childCount > 0
                            ? componentValue.childCount
                            : 0;

                        if (!name || !weight || !count) {
                          return null;
                        }

                        const base = Math.floor(weight / count);
                        const remainder = weight - base * count;

                        const items = Array.from(
                          { length: count },
                          (_, idx) => {
                            const extra = idx < remainder ? 1 : 0;
                            return {
                              label: `${name} ${idx + 1}`,
                              weight: base + extra,
                            };
                          }
                        );

                        return (
                          <div className="grade-subcomponents-preview">
                            <Text type="secondary">
                              Các thành phần con sẽ được tạo tự động:
                            </Text>
                            <ul>
                              {items.map((item) => (
                                <li key={item.label}>
                                  {item.label}: {item.weight}%
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      }}
                    </Form.Item>
                  </Card>
                ))}

                {/* Chỉ cho phép thêm mới khi chưa có cấu hình thang điểm nào */}
                {gradeComponents.length === 0 && (
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() =>
                        add({
                          name: "",
                          weightPercent: 0,
                          subComponents: [],
                        })
                      }
                      block
                    >
                      Thêm thành phần điểm
                    </Button>
                  </Form.Item>
                )}
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};

export default SubjectDetail;
