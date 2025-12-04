import React, { useEffect, useState } from "react";
import { Card, Space, Typography, Button, Table, Tag } from "antd";
import { toast } from "react-toastify";
import { CheckCircleOutlined, CalendarOutlined } from "@ant-design/icons";
import AttendanceValidationAdminService from "../../../services/admin/attendanceValidation/api";
import type { AttendanceValidationStatus } from "../../../services/admin/attendanceValidation/api";
import "./index.scss";

const { Title, Text } = Typography;

const AttendanceValidationAdminPage: React.FC = () => {
  const [status, setStatus] = useState<AttendanceValidationStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

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

  useEffect(() => {
    void loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <div className="attendance-validation-page">
      <div className="page-header">
        <Space align="center" size={12}>
          <div className="icon-wrapper">
            <CheckCircleOutlined />
          </div>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Cấu hình ngày điểm danh
            </Title>
            <Text type="secondary">
              Quản lý việc cho phép hay khóa điểm danh theo từng ngày.
            </Text>
          </div>
        </Space>
      </div>

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
          columns={[
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
          ]}
          dataSource={[
            {
              key: "attendance-validation-status",
              status,
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default AttendanceValidationAdminPage;
