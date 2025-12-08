import {
  DeleteOutlined,
  EditOutlined,
  FlagOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  createSpecializationApi,
  deleteSpecializationApi,
  fetchSpecializationsApi,
  getSpecializationByIdApi,
  updateSpecializationApi,
} from "../../../services/admin/specializations/api";
import type {
  CreateSpecializationRequest,
  SpecializationDto,
} from "../../../types/Specialization";
import "./index.scss";

const { Title, Paragraph } = Typography;
const { Search } = Input;

const DEFAULT_PAGE_SIZE = 10;

const SpecializationsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SpecializationDto[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<SpecializationDto | null>(null);
  const [form] = Form.useForm<CreateSpecializationRequest>();

  const fetchData = useCallback(
    async (page = 1, pageSize = pagination.pageSize, search = searchText) => {
      setLoading(true);
      try {
        const response = await fetchSpecializationsApi({
          pageNumber: page,
          pageSize,
          searchTerm: search?.trim() || undefined,
        });
        const items = response.data || [];
        setData(items);
        setPagination({
          page: response.pageNumber || page,
          pageSize: response.pageSize || pageSize,
          total: response.totalCount || items.length,
        });
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          "Không thể tải danh sách chuyên ngành";
        toast.error(message);
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

  const openModal = async (record?: SpecializationDto) => {
    if (record) {
      setLoading(true);
      try {
        const detail = await getSpecializationByIdApi(record.id);
        setEditing(detail);
        form.setFieldsValue({
          code: detail.code,
          name: detail.name,
          description: detail.description,
          isActive: detail.isActive ?? true,
        });
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Không thể tải chuyên ngành này"
        );
        return;
      } finally {
        setLoading(false);
      }
    } else {
      setEditing(null);
      form.resetFields();
      form.setFieldsValue({ isActive: true });
    }
    setIsModalOpen(true);
  };

  const mapErrorMessage = (message?: string) => {
    if (!message) return "Không thể lưu chuyên ngành. Vui lòng thử lại.";
    const lower = message.toLowerCase();

    // Check for duplicate code error
    if (lower.includes("already exists") || lower.includes("đã tồn tại")) {
      return "Mã chuyên ngành đã tồn tại, vui lòng chọn mã khác.";
    }

    return message;
  };

  const handleSubmit = () => {
    form.validateFields().then(async (values) => {
      const payload: CreateSpecializationRequest = {
        code: values.code.trim(),
        name: values.name.trim(),
        description: values.description?.trim(),
        isActive: values.isActive ?? true,
      };

      try {
        if (editing) {
          await updateSpecializationApi(editing.id, payload);
          toast.success("Cập nhật chuyên ngành thành công");
        } else {
          await createSpecializationApi(payload);
          toast.success("Thêm chuyên ngành thành công");
        }
        setIsModalOpen(false);
        form.resetFields();
        fetchData(pagination.page, pagination.pageSize, searchText);
      } catch (error: unknown) {
        let errorMessage = editing
          ? "Không thể cập nhật chuyên ngành"
          : "Không thể thêm chuyên ngành";

        if (axios.isAxiosError(error) && error.response?.data) {
          const data = error.response.data as {
            message?: string;
            detail?: string;
          };
          errorMessage = data.message || data.detail || errorMessage;
        }

        toast.error(mapErrorMessage(errorMessage));
      }
    });
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteSpecializationApi(id);
      toast.success("Đã xóa chuyên ngành");
      const nextPage =
        data.length === 1 && pagination.page > 1
          ? pagination.page - 1
          : pagination.page;
      fetchData(nextPage, pagination.pageSize, searchText);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Không thể xóa chuyên ngành này"
      );
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<SpecializationDto> = [
    {
      title: "Mã chuyên ngành",
      dataIndex: "code",
      key: "code",
      width: 180,
      render: (code: string) => <span className="code-pill">{code}</span>,
    },
    {
      title: "Tên chuyên ngành",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (name: string) => <div className="name-text">{name}</div>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (description?: string) =>
        description ? (
          <Paragraph
            type="secondary"
            className="description"
            ellipsis={{ rows: 2, expandable: true }}
          >
            {description}
          </Paragraph>
        ) : (
          <span style={{ color: "#bfbfbf" }}>Chưa có mô tả</span>
        ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 180,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa chuyên ngành?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger ghost size="small" icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="specializations-page">
      <Card className="specializations-card">
        <div className="page-header">
          <div className="title-block">
            <div className="icon-wrapper">
              <FlagOutlined />
            </div>
            <div>
              <p className="eyebrow">Bảng quản trị</p>
              <Title level={3} style={{ margin: 0 }}>
                Quản lý chuyên ngành
              </Title>
              <Paragraph className="subtitle">
                Thêm/sửa chuyên ngành và trạng thái kích hoạt.
              </Paragraph>
            </div>
          </div>
          <div className="header-actions">
            <Search
              placeholder="Tìm mã hoặc tên chuyên ngành"
              allowClear
              onSearch={handleSearch}
              onChange={(e) => setSearchText(e.target.value)}
              enterButton={<SearchOutlined />}
              style={{ maxWidth: 320 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
              className="primary-action"
            >
              Thêm chuyên ngành
            </Button>
          </div>
        </div>

        <Table
          loading={loading}
          dataSource={data}
          columns={columns}
          rowKey={(record) => record.id}
          className="specializations-table"
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} chuyên ngành`,
            size: "default",
            position: ["bottomRight"],
            onChange: (page, pageSize) => {
              const size = pageSize || pagination.pageSize;
              fetchData(page, size, searchText);
            },
            onShowSizeChange: (current, size) => {
              fetchData(1, size, searchText);
            },
          }}
        />
      </Card>

      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        okText={editing ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        title={editing ? "Cập nhật chuyên ngành" : "Thêm chuyên ngành mới"}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ isActive: true }}
          autoComplete="off"
        >
          <Form.Item
            label="Mã chuyên ngành"
            name="code"
            rules={[
              { required: true, message: "Vui lòng nhập mã chuyên ngành" },
              { max: 50, message: "Tối đa 50 ký tự" },
            ]}
          >
            <Input placeholder="VD: BLOCKCHAIN" />
          </Form.Item>

          <Form.Item
            label="Tên chuyên ngành"
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập tên chuyên ngành" },
              { max: 150, message: "Tối đa 150 ký tự" },
            ]}
          >
            <Input placeholder="Blockchain Development" />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ max: 500, message: "Tối đa 500 ký tự" }]}
          >
            <Input.TextArea
              placeholder="Mô tả ngắn gọn về chuyên ngành"
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SpecializationsPage;
