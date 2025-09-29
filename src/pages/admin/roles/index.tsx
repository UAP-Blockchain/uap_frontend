import React, { useState } from "react";
import {
  Table,
  Card,
  Button,
  Space,
  Input,
  Select,
  Modal,
  Form,
  message,
  Tag,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Checkbox,
  Divider,
  Badge,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  SecurityScanOutlined,
  KeyOutlined,
  FilterOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type {
  Role,
  RoleFormData,
  DEFAULT_PERMISSIONS,
  Permission,
} from "../../../models/Role";
import "./index.scss";

const { Search } = Input;
const { Option } = Select;
const { CheckboxGroup } = Checkbox;

const RolesManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: "1",
      name: "Super Admin",
      description:
        "Quyền quản trị tối cao, có thể thực hiện tất cả các chức năng trong hệ thống",
      permissions: DEFAULT_PERMISSIONS,
      status: "active",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "2",
      name: "Teacher",
      description:
        "Giảng viên có thể quản lý lớp học, điểm danh và cập nhật điểm số",
      permissions: [
        DEFAULT_PERMISSIONS[2], // manage_classes
        DEFAULT_PERMISSIONS[3], // manage_grades
        DEFAULT_PERMISSIONS[4], // manage_attendance
        DEFAULT_PERMISSIONS[6], // view_reports
      ],
      status: "active",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "3",
      name: "Student",
      description: "Sinh viên chỉ có thể xem thông tin cá nhân và điểm số",
      permissions: [
        DEFAULT_PERMISSIONS[6], // view_reports (limited)
      ],
      status: "active",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "4",
      name: "Academic Staff",
      description:
        "Nhân viên phòng đào tạo có thể quản lý sinh viên và cấp chứng chỉ",
      permissions: [
        DEFAULT_PERMISSIONS[0], // manage_students
        DEFAULT_PERMISSIONS[5], // manage_credentials
        DEFAULT_PERMISSIONS[6], // view_reports
      ],
      status: "active",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
  ]);

  const [filteredRoles, setFilteredRoles] = useState<Role[]>(roles);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Statistics
  const stats = {
    total: roles.length,
    active: roles.filter((r) => r.status === "active").length,
    inactive: roles.filter((r) => r.status === "inactive").length,
    avgPermissions:
      roles.reduce((sum, r) => sum + r.permissions.length, 0) / roles.length,
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    filterRoles(value, statusFilter);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    filterRoles(searchText, value);
  };

  const filterRoles = (search: string, status: string) => {
    let filtered = roles;

    if (search) {
      filtered = filtered.filter(
        (role) =>
          role.name.toLowerCase().includes(search.toLowerCase()) ||
          role.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== "all") {
      filtered = filtered.filter((role) => role.status === status);
    }

    setFilteredRoles(filtered);
  };

  const showModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      form.setFieldsValue({
        name: role.name,
        description: role.description,
        status: role.status,
        permissions: role.permissions.map((p) => p.id),
      });
    } else {
      setEditingRole(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then((values: RoleFormData) => {
      const selectedPermissions = DEFAULT_PERMISSIONS.filter((p) =>
        values.permissions.includes(p.id)
      );

      const roleData: Role = {
        id: editingRole?.id || Date.now().toString(),
        name: values.name,
        description: values.description,
        permissions: selectedPermissions,
        status: values.status,
        createdAt: editingRole?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editingRole) {
        setRoles((prev) =>
          prev.map((r) => (r.id === editingRole.id ? roleData : r))
        );
        message.success("Cập nhật vai trò thành công!");
      } else {
        setRoles((prev) => [...prev, roleData]);
        message.success("Thêm vai trò thành công!");
      }

      setIsModalVisible(false);
      filterRoles(searchText, statusFilter);
    });
  };

  const handleDelete = (id: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== id));
    filterRoles(searchText, statusFilter);
    message.success("Xóa vai trò thành công!");
  };

  const getStatusColor = (status: string) => {
    return status === "active" ? "success" : "error";
  };

  const getStatusText = (status: string) => {
    return status === "active" ? "Hoạt động" : "Không hoạt động";
  };

  const getPermissionIcon = (action: string) => {
    switch (action) {
      case "manage":
        return <SecurityScanOutlined />;
      case "create":
        return <PlusOutlined />;
      case "read":
        return <InfoCircleOutlined />;
      case "update":
        return <EditOutlined />;
      case "delete":
        return <DeleteOutlined />;
      default:
        return <KeyOutlined />;
    }
  };

  const getPermissionColor = (action: string) => {
    switch (action) {
      case "manage":
        return "red";
      case "create":
        return "green";
      case "read":
        return "blue";
      case "update":
        return "orange";
      case "delete":
        return "volcano";
      default:
        return "default";
    }
  };

  const columns: ColumnsType<Role> = [
    {
      title: "Tên vai trò",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (name, record) => (
        <div className="role-name">
          <SecurityScanOutlined className="role-icon" />
          <div>
            <div className="name">{name}</div>
            <div className="description">{record.description}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Quyền hạn",
      dataIndex: "permissions",
      key: "permissions",
      width: 400,
      render: (permissions: Permission[]) => (
        <div className="permissions-list">
          {permissions.slice(0, 3).map((permission) => (
            <Tag
              key={permission.id}
              color={getPermissionColor(permission.action)}
              icon={getPermissionIcon(permission.action)}
              className="permission-tag"
            >
              {permission.description}
            </Tag>
          ))}
          {permissions.length > 3 && (
            <Tooltip
              title={
                <div>
                  {permissions.slice(3).map((permission) => (
                    <div key={permission.id} className="tooltip-permission">
                      {getPermissionIcon(permission.action)}{" "}
                      {permission.description}
                    </div>
                  ))}
                </div>
              }
            >
              <Tag color="default" className="more-permissions">
                +{permissions.length - 3} quyền khác
              </Tag>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: "Số quyền",
      dataIndex: "permissions",
      key: "permissionCount",
      width: 100,
      align: "center",
      render: (permissions: Permission[]) => (
        <div className="permission-count">
          <Badge
            count={permissions.length}
            style={{
              backgroundColor:
                permissions.length >= 5
                  ? "#ff4d4f"
                  : permissions.length >= 3
                  ? "#faad14"
                  : "#52c41a",
            }}
          />
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Badge status={getStatusColor(status)} text={getStatusText(status)} />
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa vai trò này?"
            description="Hành động này không thể hoàn tác!"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
            icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              disabled={record.name === "Super Admin"}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="roles-management">
      <div className="page-header">
        <h1>Quản lý Vai trò</h1>
        <p>Quản lý vai trò và phân quyền trong hệ thống blockchain</p>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Tổng vai trò"
              value={stats.total}
              prefix={<SecurityScanOutlined />}
              valueStyle={{ color: "#ff6b35" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Đang hoạt động"
              value={stats.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Không hoạt động"
              value={stats.inactive}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Quyền TB/Vai trò"
              value={stats.avgPermissions.toFixed(1)}
              prefix={<KeyOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="roles-table-card">
        <div className="table-header">
          <div className="filters">
            <Search
              placeholder="Tìm kiếm theo tên vai trò, mô tả..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 300 }}
              prefix={<SearchOutlined />}
            />
            <Select
              placeholder="Trạng thái"
              style={{ width: 150 }}
              value={statusFilter}
              onChange={handleStatusFilter}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">Tất cả</Option>
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Không hoạt động</Option>
            </Select>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
            size="large"
          >
            Thêm vai trò
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredRoles}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} vai trò`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={editingRole ? "Chỉnh sửa vai trò" : "Thêm vai trò mới"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={700}
        okText={editingRole ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: "active", permissions: [] }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên vai trò"
                rules={[
                  { required: true, message: "Vui lòng nhập tên vai trò!" },
                ]}
              >
                <Input
                  placeholder="Nhập tên vai trò"
                  prefix={<SecurityScanOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái!" },
                ]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="active">Hoạt động</Option>
                  <Option value="inactive">Không hoạt động</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input.TextArea
              placeholder="Nhập mô tả vai trò"
              rows={3}
              showCount
              maxLength={200}
            />
          </Form.Item>

          <Form.Item
            name="permissions"
            label="Quyền hạn"
            rules={[
              { required: true, message: "Vui lòng chọn ít nhất một quyền!" },
            ]}
          >
            <div className="permissions-selection">
              <CheckboxGroup style={{ width: "100%" }}>
                <Row gutter={[16, 16]}>
                  {DEFAULT_PERMISSIONS.map((permission) => (
                    <Col span={12} key={permission.id}>
                      <Checkbox
                        value={permission.id}
                        className="permission-checkbox"
                      >
                        <div className="permission-item">
                          <div className="permission-header">
                            <Tag
                              color={getPermissionColor(permission.action)}
                              icon={getPermissionIcon(permission.action)}
                              size="small"
                            >
                              {permission.name}
                            </Tag>
                          </div>
                          <div className="permission-description">
                            {permission.description}
                          </div>
                        </div>
                      </Checkbox>
                    </Col>
                  ))}
                </Row>
              </CheckboxGroup>
            </div>
          </Form.Item>

          <Divider />

          <div className="permission-info">
            <InfoCircleOutlined className="info-icon" />
            <div className="info-text">
              <strong>Lưu ý:</strong> Hãy cẩn thận khi phân quyền. Quyền "Quản
              lý" bao gồm tất cả các quyền con (tạo, đọc, cập nhật, xóa).
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default RolesManagement;
