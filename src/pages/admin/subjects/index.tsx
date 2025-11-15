import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Col,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Popconfirm,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  BookOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import type { SubjectDto } from "../../../types/Subject";
import type { SemesterDto } from "../../../types/Semester";
import {
  fetchSubjectsApi,
  getSubjectByIdApi,
  createSubjectApi,
  updateSubjectApi,
  deleteSubjectApi,
  type CreateSubjectRequest,
  type UpdateSubjectRequest,
} from "../../../services/admin/subjects/api";
import { fetchSemestersApi } from "../../../services/admin/semesters/api";
import "./index.scss";

const { Search } = Input;
const { Option } = Select;

interface SubjectFormValues {
  subjectCode: string;
  subjectName: string;
  credits: number;
  semesterId: string;
}

const DEFAULT_PAGE_SIZE = 10;

const SubjectsManagement: React.FC = () => {
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [semesters, setSemesters] = useState<SemesterDto[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectDto | null>(null);
  const [form] = Form.useForm<SubjectFormValues>();
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalCount: 0,
  });

  const loadSemesters = async () => {
    try {
      const response = await fetchSemestersApi({
        pageNumber: 1,
        pageSize: 200,
      });
      setSemesters(response.data || []);
    } catch {
      // Silently fail, semesters will be empty
    }
  };

  useEffect(() => {
    loadSemesters();
  }, []);

  const stats = useMemo(() => {
    const total = pagination.totalCount;
    const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
    const totalClasses = subjects.reduce((sum, s) => sum + s.totalClasses, 0);
    const uniqueSemesters = new Set(subjects.map((s) => s.semesterId)).size;
    return {
      total,
      totalCredits,
      totalClasses,
      uniqueSemesters,
    };
  }, [pagination.totalCount, subjects]);

  const fetchData = useCallback(
    async (
      pageNumber = 1,
      pageSize = pagination.pageSize,
      search = searchText
    ) => {
      setLoading(true);
      try {
        const response = await fetchSubjectsApi({
          pageNumber,
          pageSize,
          searchTerm: search || undefined,
        });
        setSubjects(response.data || []);
        setPagination({
          pageNumber: response.pageNumber || pageNumber,
          pageSize: response.pageSize || pageSize,
          totalCount: response.totalCount || response.data?.length || 0,
        });
      } catch {
        toast.error("Không thể tải danh sách môn học");
      } finally {
        setLoading(false);
      }
    },
    [pagination.pageSize, searchText]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchData(1, pagination.pageSize, value);
  };

  const showModal = async (subject?: SubjectDto) => {
    if (subject) {
      try {
        setLoading(true);
        const subjectDetail = await getSubjectByIdApi(subject.id);
        setEditingSubject(subjectDetail);
        form.setFieldsValue({
          subjectCode: subjectDetail.subjectCode,
          subjectName: subjectDetail.subjectName,
          credits: subjectDetail.credits,
          semesterId: subjectDetail.semesterId,
        });
      } catch {
        toast.error("Không thể tải thông tin môn học");
      } finally {
        setLoading(false);
      }
    } else {
      setEditingSubject(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      try {
        const payload: CreateSubjectRequest = {
          subjectCode: values.subjectCode.trim(),
          subjectName: values.subjectName.trim(),
          credits: values.credits,
          semesterId: values.semesterId,
        };

        if (editingSubject) {
          await updateSubjectApi(editingSubject.id, payload);
          toast.success("Cập nhật môn học thành công");
        } else {
          await createSubjectApi(payload);
          toast.success("Tạo môn học thành công");
        }
        setIsModalVisible(false);
        form.resetFields();
        fetchData(pagination.pageNumber, pagination.pageSize);
      } catch {
        toast.error(
          editingSubject
            ? "Không thể cập nhật môn học"
            : "Không thể tạo môn học"
        );
      }
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSubjectApi(id);
      toast.success("Xóa môn học thành công");
      fetchData(pagination.pageNumber, pagination.pageSize);
    } catch {
      toast.error("Không thể xóa môn học");
    }
  };

  const columns: ColumnsType<SubjectDto> = [
    {
      title: "Môn học",
      key: "subjectInfo",
      width: 250,
      render: (_, record) => (
        <div className="subject-info">
          <div className="subject-info__code">{record.subjectCode}</div>
          <div className="subject-info__name">{record.subjectName}</div>
        </div>
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
      title: "Học kì",
      dataIndex: "semesterName",
      key: "semesterName",
      width: 150,
      render: (semesterName: string) => (
        <Tag color="blue" className="semester-tag">
          {semesterName}
        </Tag>
      ),
    },
    {
      title: "Số lớp",
      dataIndex: "totalClasses",
      key: "totalClasses",
      width: 100,
      align: "center",
      render: (totalClasses: number) => (
        <span className="classes-count">{totalClasses}</span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => showModal(record)}
              className="action-btn-edit"
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa môn học này?"
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
        </Space>
      ),
    },
  ];

  const statsCards = [
    {
      label: "Tổng môn học",
      value: stats.total,
      accent: "total",
      icon: <BookOutlined />,
    },
    {
      label: "Tổng tín chỉ",
      value: stats.totalCredits,
      accent: "credits",
      icon: <BookOutlined />,
    },
    {
      label: "Tổng lớp học",
      value: stats.totalClasses,
      accent: "classes",
      icon: <CalendarOutlined />,
    },
    {
      label: "Học kì",
      value: stats.uniqueSemesters,
      accent: "semesters",
      icon: <CalendarOutlined />,
    },
  ];

  return (
    <div className="subjects-management">
      <Card className="subjects-panel">
        <div className="overview-header">
          <div className="title-block">
            <div className="title-icon">
              <BookOutlined />
            </div>
            <div>
              <p className="eyebrow">Bảng quản trị</p>
              <h2>Quản lý Môn học</h2>
            </div>
          </div>
          <div className="header-actions">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="primary-action"
              onClick={() => showModal()}
            >
              Thêm môn học
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
          <Row gutter={[8, 8]} align="middle" className="filter-row-compact">
            <Col xs={24} sm={24} md={24}>
              <div className="filter-field">
                <label>Tìm kiếm</label>
                <Search
                  placeholder="Nhập mã môn học hoặc tên môn học..."
                  allowClear
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={handleSearch}
                  prefix={<SearchOutlined />}
                  size="large"
                  enterButton="Tìm kiếm"
                />
              </div>
            </Col>
          </Row>
        </div>

        <div className="table-section">
          <Table
            columns={columns}
            dataSource={subjects}
            loading={loading}
            rowKey="id"
            className="subjects-table"
            pagination={{
              current: pagination.pageNumber,
              pageSize: pagination.pageSize,
              total: pagination.totalCount,
              showSizeChanger: false,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total}`,
              size: "small",
              onChange: (page) =>
                fetchData(page, pagination.pageSize, searchText),
            }}
            scroll={{ x: 800 }}
            size="small"
          />
        </div>
      </Card>

      <Modal
        title={editingSubject ? "Chỉnh sửa môn học" : "Thêm môn học mới"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        okText={editingSubject ? "Cập nhật" : "Tạo"}
        cancelText="Hủy"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ credits: 3 }}
        >
          <Form.Item
            name="subjectCode"
            label="Mã môn học"
            rules={[{ required: true, message: "Vui lòng nhập mã môn học!" }]}
          >
            <Input placeholder="VD: AI401, BC202..." />
          </Form.Item>

          <Form.Item
            name="subjectName"
            label="Tên môn học"
            rules={[{ required: true, message: "Vui lòng nhập tên môn học!" }]}
          >
            <Input placeholder="Nhập tên môn học" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
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
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="semesterId"
                label="Học kì"
                rules={[{ required: true, message: "Vui lòng chọn học kì!" }]}
              >
                <Select
                  placeholder="Chọn học kì"
                  showSearch
                  optionFilterProp="label"
                >
                  {semesters.map((semester) => (
                    <Option
                      key={semester.id}
                      value={semester.id}
                      label={semester.name}
                    >
                      {semester.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default SubjectsManagement;

