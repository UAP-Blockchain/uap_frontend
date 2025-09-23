import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Input,
  Select,
  Space,
  Button,
  Tag,
  Statistic,
  DatePicker,
  message,
  Tooltip,
  Modal,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FilterOutlined,
  CalendarOutlined,
  BarChartOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { TableColumnsType, TableProps } from "antd";
import dayjs from "dayjs";
import "./VerificationHistory.scss";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface HistoryRecord {
  id: string;
  credentialId: string;
  credentialTitle: string;
  verificationMethod: "qr" | "manual" | "file";
  timestamp: string;
  result: "success" | "failed" | "pending";
  institutionName: string;
  studentName: string;
  verifierInfo?: string;
}

const VerificationHistory: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [filterMethod, setFilterMethod] = useState<string | undefined>(
    undefined
  );
  const [filterResult, setFilterResult] = useState<string | undefined>(
    undefined
  );
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  );
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Mock history data
  const historyData: HistoryRecord[] = [
    {
      id: "hist_001",
      credentialId: "deg_001",
      credentialTitle: "Bachelor of Software Engineering",
      verificationMethod: "qr",
      timestamp: "2024-09-12T14:30:00Z",
      result: "success",
      institutionName: "FPT University",
      studentName: "Nguyễn Văn Hoàng",
      verifierInfo: "HR Department - VNG Corporation",
    },
    {
      id: "hist_002",
      credentialId: "cert_001",
      credentialTitle: "AWS Cloud Practitioner",
      verificationMethod: "manual",
      timestamp: "2024-09-12T13:15:00Z",
      result: "success",
      institutionName: "Amazon Web Services",
      studentName: "Trần Thị Mai",
      verifierInfo: "Tech Lead - Grab Vietnam",
    },
    {
      id: "hist_003",
      credentialId: "trans_001",
      credentialTitle: "Academic Transcript Fall 2023",
      verificationMethod: "file",
      timestamp: "2024-09-12T11:45:00Z",
      result: "failed",
      institutionName: "FPT University",
      studentName: "Lê Văn Nam",
      verifierInfo: "Recruiter - Shopee",
    },
    {
      id: "hist_004",
      credentialId: "deg_002",
      credentialTitle: "Master of Business Administration",
      verificationMethod: "qr",
      timestamp: "2024-09-12T10:20:00Z",
      result: "success",
      institutionName: "VNU University",
      studentName: "Phạm Thị Lan",
      verifierInfo: "Director - FPT Software",
    },
    {
      id: "hist_005",
      credentialId: "cert_002",
      credentialTitle: "Google Analytics Certified",
      verificationMethod: "manual",
      timestamp: "2024-09-12T09:30:00Z",
      result: "pending",
      institutionName: "Google",
      studentName: "Hoàng Văn Đức",
      verifierInfo: "Marketing Manager - Tiki",
    },
  ];

  // Statistics
  const stats = {
    totalVerifications: historyData.length,
    successfulVerifications: historyData.filter(
      (item) => item.result === "success"
    ).length,
    failedVerifications: historyData.filter((item) => item.result === "failed")
      .length,
    successRate: Math.round(
      (historyData.filter((item) => item.result === "success").length /
        historyData.length) *
        100
    ),
  };

  const getMethodTag = (method: string) => {
    const config = {
      qr: { color: "green", text: "QR Scan" },
      manual: { color: "blue", text: "Manual" },
      file: { color: "purple", text: "File Upload" },
    };
    const { color, text } = config[method as keyof typeof config] || {
      color: "default",
      text: method,
    };
    return <Tag color={color}>{text}</Tag>;
  };

  const getResultTag = (result: string) => {
    switch (result) {
      case "success":
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Verified
          </Tag>
        );
      case "failed":
        return (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            Failed
          </Tag>
        );
      case "pending":
        return (
          <Tag color="warning" icon={<ExclamationCircleOutlined />}>
            Pending
          </Tag>
        );
      default:
        return <Tag color="default">{result}</Tag>;
    }
  };

  const handleViewDetails = (record: HistoryRecord) => {
    navigate("/public-portal/results", {
      state: {
        success: record.result === "success",
        verificationData: { id: record.credentialId },
        method: record.verificationMethod,
      },
    });
  };

  const handleDeleteRecord = (id: string) => {
    Modal.confirm({
      title: "Delete Verification Record",
      content: "Are you sure you want to delete this verification record?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        message.success("Verification record deleted successfully");
      },
    });
  };

  const handleExportHistory = () => {
    const element = document.createElement("a");
    element.setAttribute(
      "download",
      `verification-history-${dayjs().format("YYYY-MM-DD")}.csv`
    );
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    message.success("History exported successfully");
  };

  const columns: TableColumnsType<HistoryRecord> = [
    {
      title: "Credential",
      dataIndex: "credentialTitle",
      key: "credentialTitle",
      render: (text: string, record: HistoryRecord) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            ID: {record.credentialId}
          </Text>
        </div>
      ),
      ellipsis: true,
    },
    {
      title: "Student",
      dataIndex: "studentName",
      key: "studentName",
      render: (text: string, record: HistoryRecord) => (
        <div>
          <Text>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.institutionName}
          </Text>
        </div>
      ),
    },
    {
      title: "Method",
      dataIndex: "verificationMethod",
      key: "verificationMethod",
      render: (method: string) => getMethodTag(method),
      filters: [
        { text: "QR Scan", value: "qr" },
        { text: "Manual", value: "manual" },
        { text: "File Upload", value: "file" },
      ],
      onFilter: (value: any, record: HistoryRecord) =>
        record.verificationMethod === value,
    },
    {
      title: "Result",
      dataIndex: "result",
      key: "result",
      render: (result: string) => getResultTag(result),
      filters: [
        { text: "Verified", value: "success" },
        { text: "Failed", value: "failed" },
        { text: "Pending", value: "pending" },
      ],
      onFilter: (value: any, record: HistoryRecord) => record.result === value,
    },
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (timestamp: string) => (
        <div>
          <Text>{dayjs(timestamp).format("MMM DD, YYYY")}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(timestamp).format("HH:mm:ss")}
          </Text>
        </div>
      ),
      sorter: (a: HistoryRecord, b: HistoryRecord) =>
        dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix(),
      defaultSortOrder: "descend",
    },
    {
      title: "Verifier",
      dataIndex: "verifierInfo",
      key: "verifierInfo",
      render: (text: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {text || "Anonymous"}
        </Text>
      ),
      ellipsis: true,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: HistoryRecord) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteRecord(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredData = historyData.filter((item) => {
    const matchesSearch =
      item.credentialTitle.toLowerCase().includes(searchText.toLowerCase()) ||
      item.studentName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.credentialId.toLowerCase().includes(searchText.toLowerCase()) ||
      item.institutionName.toLowerCase().includes(searchText.toLowerCase());

    const matchesMethod =
      !filterMethod || item.verificationMethod === filterMethod;
    const matchesResult = !filterResult || item.result === filterResult;

    const matchesDate =
      !dateRange ||
      (dayjs(item.timestamp).isAfter(dateRange[0]) &&
        dayjs(item.timestamp).isBefore(dateRange[1]));

    return matchesSearch && matchesMethod && matchesResult && matchesDate;
  });

  const handleTableChange: TableProps<HistoryRecord>["onChange"] = (
    pagination,
    filters,
    sorter
  ) => {
    // Handle table changes if needed
  };

  return (
    <div className="verification-history">
      {/* Page Header */}
      <div className="page-header">
        <Title level={2} style={{ margin: 0, color: "#722ed1" }}>
          📊 Verification History
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Track and manage all credential verification activities
        </Text>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Verifications"
              value={stats.totalVerifications}
              prefix={
                <SafetyCertificateOutlined style={{ color: "#1890ff" }} />
              }
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Successful"
              value={stats.successfulVerifications}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Failed"
              value={stats.failedVerifications}
              prefix={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Success Rate"
              value={stats.successRate}
              suffix="%"
              prefix={<BarChartOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Search
              placeholder="Search by credential, student, or institution..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              placeholder="Method"
              value={filterMethod}
              onChange={setFilterMethod}
              allowClear
              style={{ width: "100%" }}
            >
              <Option value="qr">QR Scan</Option>
              <Option value="manual">Manual</Option>
              <Option value="file">File Upload</Option>
            </Select>
          </Col>
          <Col xs={12} md={4}>
            <Select
              placeholder="Result"
              value={filterResult}
              onChange={setFilterResult}
              allowClear
              style={{ width: "100%" }}
            >
              <Option value="success">Verified</Option>
              <Option value="failed">Failed</Option>
              <Option value="pending">Pending</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: "100%" }}
              placeholder={["Start Date", "End Date"]}
            />
          </Col>
          <Col xs={24} md={2}>
            <Space>
              <Button
                icon={<FilterOutlined />}
                onClick={() => {
                  setSearchText("");
                  setFilterMethod(undefined);
                  setFilterResult(undefined);
                  setDateRange(null);
                }}
              >
                Clear
              </Button>
            </Space>
          </Col>
        </Row>

        <Row justify="end" style={{ marginTop: 16 }}>
          <Space>
            <Button
              icon={<BarChartOutlined />}
              onClick={() => setShowAnalytics(true)}
            >
              Analytics
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExportHistory}
            >
              Export History
            </Button>
          </Space>
        </Row>
      </Card>

      {/* History Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          onChange={handleTableChange}
          rowKey="id"
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} records`,
          }}
          scroll={{ x: 1000 }}
          size="middle"
        />
      </Card>

      {/* Analytics Modal */}
      <Modal
        title="📈 Verification Analytics"
        open={showAnalytics}
        onCancel={() => setShowAnalytics(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setShowAnalytics(false)}>
            Close
          </Button>,
        ]}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card size="small">
              <Statistic
                title="Peak Verification Hour"
                value="14:00"
                suffix="(34 verifications)"
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card size="small">
              <Statistic
                title="Most Verified Institution"
                value="FPT University"
                suffix="(45%)"
                prefix={<SafetyCertificateOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24}>
            <Card size="small">
              <Title level={5}>Recent Trends</Title>
              <Text type="secondary">
                • QR Code scanning is the most popular method (60% of
                verifications)
                <br />
                • Success rate has improved by 12% this month
                <br />
                • File upload verifications have increased by 25%
                <br />• Peak verification times: 9-11 AM and 2-4 PM
              </Text>
            </Card>
          </Col>
        </Row>
      </Modal>
    </div>
  );
};

export default VerificationHistory;
