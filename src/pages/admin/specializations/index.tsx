import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  Popconfirm,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  FlagOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import type {
  CreateSpecializationRequest,
  SpecializationDto,
} from "../../../types/Specialization";
import {
  createSpecializationApi,
  deleteSpecializationApi,
  fetchSpecializationsApi,
  getSpecializationByIdApi,
  updateSpecializationApi,
} from "../../../services/admin/specializations/api";
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

  const headerStats = useMemo(
    () => ({
      total: pagination.total,
      active: data.filter((item) => item.isActive).length,
      inactive: data.filter((item) => item.isActive === false).length,
    }),
    [data, pagination.total]
  );

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
          "Không thể tải danh sách chuyên môn";
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
          error?.response?.data?.message || "Không thể tải chuyên môn này"
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
          toast.success("Cập nhật chuyên môn thành công");
        } else {
          await createSpecializationApi(payload);
          toast.success("Thêm chuyên môn thành công");
        }
        setIsModalOpen(false);
        form.resetFields();
        fetchData(pagination.page, pagination.pageSize, searchText);
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message ||
            (editing
              ? "Không thể cập nhật chuyên môn"
              : "Không thể thêm chuyên môn")
        );
      }
    });
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteSpecializationApi(id);
      toast.success("Đã xóa chuyên môn");
      const nextPage =
        data.length === 1 && pagination.page > 1
          ? pagination.page - 1
          : pagination.page;
      fetchData(nextPage, pagination.pageSize, searchText);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Không thể xóa chuyên môn này"
      );
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<SpecializationDto> = [
    {
      title: "Mã chuyên môn",
      dataIndex: "code",
      key: "code",
      width: 180,
      render: (code: string) => <span className="code-pill">{code}</span>,
    },
    {
      title: "Tên chuyên môn",
      dataIndex: "name",
      key: "name",
      render: (name: string, record) => (
        <div className="name-cell">
          <div className="name-text">{name}</div>
          {record.description && (
            <Paragraph type="secondary" className="description">
              {record.description}
            </Paragraph>
          )}
        </div>
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
            title="Xóa chuyên môn?"
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
                Quản lý chuyên môn
              </Title>
              <Paragraph className="subtitle">
                Thêm/sửa chuyên môn và trạng thái kích hoạt.
              </Paragraph>
            </div>
          </div>
          <div className="header-actions">
            <Search
              placeholder="Tìm mã hoặc tên chuyên môn"
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
              Thêm chuyên môn
            </Button>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <span className="label">Tổng số</span>
            <span className="value">{headerStats.total}</span>
          </div>
          <div className="stat-card">
            <span className="label">Đang bật</span>
            <span className="value success">{headerStats.active}</span>
          </div>
          <div className="stat-card">
            <span className="label">Đang tắt</span>
            <span className="value danger">{headerStats.inactive}</span>
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
            onChange: (page, pageSize) => fetchData(page, pageSize, searchText),
          }}
        />
      </Card>

      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        okText={editing ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        title={editing ? "Cập nhật chuyên môn" : "Thêm chuyên môn mới"}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ isActive: true }}
          autoComplete="off"
        >
          <Form.Item
            label="Mã chuyên môn"
            name="code"
            rules={[
              { required: true, message: "Vui lòng nhập mã chuyên môn" },
              { max: 50, message: "Tối đa 50 ký tự" },
            ]}
          >
            <Input placeholder="VD: BLOCKCHAIN" />
          </Form.Item>

          <Form.Item
            label="Tên chuyên môn"
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập tên chuyên môn" },
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
              placeholder="Mô tả ngắn gọn về chuyên môn"
              rows={3}
            />
          </Form.Item>

       
        </Form>
      </Modal>
    </div>
  );
};

export default SpecializationsPage;
