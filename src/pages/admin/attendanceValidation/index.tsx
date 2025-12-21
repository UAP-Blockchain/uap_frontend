import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  Space,
  Typography,
  Button,
  Table,
  Tag,
  Tabs,
  Input,
  Descriptions,
  Alert,
  Modal,
} from "antd";
import { toast } from "react-toastify";
import {
  CheckCircleOutlined,
  CalendarOutlined,
  WarningOutlined,
  FileProtectOutlined,
} from "@ant-design/icons";
import AttendanceValidationAdminService, {
  type AttendanceValidationStatus,
  type CredentialInfo,
} from "../../../services/admin/attendanceValidation/api";
import "./index.scss";

const { Title, Text } = Typography;

const AttendanceValidationAdminPage: React.FC = () => {
  const [status, setStatus] = useState<AttendanceValidationStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Credential Tampering State
  const [credentials, setCredentials] = useState<CredentialInfo[]>([]);
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const [selectedCredential, setSelectedCredential] =
    useState<CredentialInfo | null>(null);
  const [tampering, setTampering] = useState(false);
  const [tamperFileUrl, setTamperFileUrl] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasFetchedRef = useRef(false);

  const loadStatus = async () => {
    setLoadingStatus(true);
    setError(null);
    try {
      const data = await AttendanceValidationAdminService.getStatus();
      setStatus(data);
    } catch (err) {
      console.error("Không thể tải trạng thái validate ngày điểm danh:", err);
      setError("Không thể tải trạng thái validate ngày điểm danh.");
      setStatus(null);
    } finally {
      setLoadingStatus(false);
      setInitialized(true);
    }
  };

  const loadCredentials = async () => {
    setLoadingCredentials(true);
    try {
      const data = await AttendanceValidationAdminService.getCredentials();
      setCredentials(data);
    } catch (err) {
      console.error("Không thể tải danh sách chứng chỉ:", err);
      toast.error("Không thể tải danh sách chứng chỉ.");
    } finally {
      setLoadingCredentials(false);
    }
  };

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;

    const loadAll = async () => {
      await Promise.allSettled([loadStatus(), loadCredentials()]);
    };

    void loadAll();
  }, []);

  const handleUpdate = async (enabled: boolean) => {
    setUpdating(true);
    setError(null);
    try {
      const updated = await AttendanceValidationAdminService.updateStatus(
        enabled
      );
      setStatus(updated);
      const message =
        updated.enabled === true
          ? "Đã BẬT kiểm tra ngày điểm danh."
          : "Đã TẮT kiểm tra ngày điểm danh.";
      toast.success(message);
    } catch (err) {
      console.error(
        "Không thể cập nhật trạng thái validate ngày điểm danh:",
        err
      );
      setError("Không thể cập nhật trạng thái validate ngày điểm danh.");
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenTamperModal = (record: CredentialInfo) => {
    setSelectedCredential(record);
    setTamperFileUrl(record.fileUrl);
    setIsModalOpen(true);
  };

  const handleCloseTamperModal = () => {
    setIsModalOpen(false);
    setSelectedCredential(null);
    setTamperFileUrl("");
  };

  const handleTamper = async () => {
    if (!selectedCredential) {
      toast.warning("Vui lòng chọn chứng chỉ cần giả mạo.");
      return;
    }
    if (!tamperFileUrl) {
      toast.warning("Vui lòng nhập đường dẫn file mới.");
      return;
    }

    setTampering(true);
    try {
      const updated = await AttendanceValidationAdminService.tamperCredential(
        selectedCredential.id,
        tamperFileUrl
      );
      setCredentials((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      setSelectedCredential(updated);
      toast.success("Đã giả mạo dữ liệu chứng chỉ thành công!");
      handleCloseTamperModal();
    } catch (err) {
      console.error("Lỗi khi giả mạo chứng chỉ:", err);
      toast.error("Không thể giả mạo chứng chỉ.");
    } finally {
      setTampering(false);
    }
  };

  const configurationColumns = [
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "50%",
      align: "center" as const,
      render: () => {
        if (error) {
          return <Tag color="red">Lỗi tải dữ liệu</Tag>;
        }
        if (loadingStatus) {
          return <Tag>Đang tải...</Tag>;
        }
        if (!initialized || status === null) {
          return <Tag>Chưa có dữ liệu</Tag>;
        }
        return status.enabled ? (
          <Tag color="green">Đang BẬT</Tag>
        ) : (
          <Tag color="orange">Đang TẮT</Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: "50%",
      align: "center" as const,
      render: () => (
        <Space>
          <Button
            size="small"
            type="primary"
            disabled={updating}
            loading={updating}
            onClick={() => void handleUpdate(true)}
          >
            Bật validate
          </Button>
          <Button
            size="small"
            danger
            disabled={updating}
            loading={updating}
            onClick={() => void handleUpdate(false)}
          >
            Tắt validate
          </Button>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: "configuration",
      label: "Cấu hình",
      children: (
        <Card
          title={
            <Space align="center">
              <CalendarOutlined />
              <span>Kiểm tra ngày điểm danh</span>
            </Space>
          }
        >
          <Table
            className="attendance-validation-table"
            pagination={false}
            size="middle"
            columns={configurationColumns}
            dataSource={[
              {
                key: "attendance-validation-status",
                status,
              },
            ]}
          />
        </Card>
      ),
    },
    {
      key: "tamper-credential",
      label: "Giả mạo chứng chỉ",
      children: (
        <Card
          title={
            <Space align="center">
              <FileProtectOutlined />
              <span>Giả mạo dữ liệu chứng chỉ (Test Verification)</span>
            </Space>
          }
        >
          <Alert
            message="Cảnh báo"
            description="Chức năng này dùng để thay đổi đường dẫn file trong Database NHƯNG KHÔNG cập nhật Blockchain. Điều này sẽ khiến quá trình xác thực chứng chỉ thất bại (do hash file không khớp với hash trên blockchain)."
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            style={{ marginBottom: 24 }}
          />

          <Table
            dataSource={credentials}
            rowKey="id"
            loading={loadingCredentials}
            pagination={{ pageSize: 10 }}
            className="tamper-table"
            columns={[
              {
                title: "Sinh viên",
                key: "student",
                render: (_, record) => (
                  <Space direction="vertical" size={0}>
                    <Text strong>{record.studentName}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {record.studentCode}
                    </Text>
                  </Space>
                ),
              },
              {
                title: "Chứng chỉ",
                dataIndex: "certificateName",
                key: "certificateName",
              },
              {
                title: "Ngày cấp",
                dataIndex: "issuedDate",
                key: "issuedDate",
                render: (d: string) => new Date(d).toLocaleDateString("vi-VN"),
                width: 120,
              },
              {
                title: "File URL",
                dataIndex: "fileUrl",
                key: "fileUrl",
                ellipsis: true,
              },
              {
                title: "Thao tác",
                key: "action",
                width: 100,
                align: "center",
                render: (_, record) => (
                  <Button
                    size="small"
                    type="primary"
                    danger
                    onClick={() => handleOpenTamperModal(record)}
                  >
                    Giả mạo
                  </Button>
                ),
              },
            ]}
          />

          <Modal
            title="Giả mạo dữ liệu chứng chỉ"
            open={isModalOpen}
            onCancel={handleCloseTamperModal}
            className="tamper-modal"
            footer={[
              <Button key="cancel" onClick={handleCloseTamperModal}>
                Hủy
              </Button>,
              <Button
                key="submit"
                type="primary"
                danger
                loading={tampering}
                onClick={() => void handleTamper()}
              >
                Cập nhật Database
              </Button>,
            ]}
          >
            {selectedCredential && (
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="middle"
              >
                <Alert
                  message="Hành động này sẽ làm sai lệch dữ liệu giữa Database và Blockchain."
                  type="error"
                  showIcon
                />

                <Descriptions bordered size="small" column={1}>
                  <Descriptions.Item label="Sinh viên">
                    {selectedCredential.studentName} (
                    {selectedCredential.studentCode})
                  </Descriptions.Item>
                  <Descriptions.Item label="Chứng chỉ">
                    {selectedCredential.certificateName}
                  </Descriptions.Item>
                  <Descriptions.Item label="File URL hiện tại">
                    <Text copyable ellipsis>
                      {selectedCredential.fileUrl}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="IPFS Hash">
                    <Text copyable ellipsis>
                      {selectedCredential.ipfsHash}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>

                <div>
                  <Text strong>URL File Giả mạo:</Text>
                  <Input
                    style={{ marginTop: 8 }}
                    value={tamperFileUrl}
                    onChange={(e) => setTamperFileUrl(e.target.value)}
                    placeholder="Nhập URL file giả mạo..."
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Nhập đường dẫn file mới (ví dụ: file đã bị chỉnh sửa nội
                    dung)
                  </Text>
                </div>
              </Space>
            )}
          </Modal>
        </Card>
      ),
    },
  ];

  return (
    <div className="attendance-validation-page">
      <div className="page-header">
        <Space align="center" size={12}>
          <div className="icon-wrapper">
            <CheckCircleOutlined />
          </div>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Cấu hình và giả mạo dữ liệu
            </Title>
            <Text type="secondary">
              Quản lý việc cho phép hay khóa điểm danh theo từng ngày.
            </Text>
          </div>
        </Space>
      </div>

      <Tabs items={tabItems} defaultActiveKey="configuration" />
    </div>
  );
};

export default AttendanceValidationAdminPage;
