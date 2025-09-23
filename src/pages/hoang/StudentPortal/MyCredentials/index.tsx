import {
  BookOutlined,
  CalendarOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileTextOutlined,
  FilterOutlined,
  LinkOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  ShareAltOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import type { TableColumnsType, TableProps } from "antd";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Input,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyCredentials.scss";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface CredentialData {
  key: string;
  id: string;
  type: "degree" | "transcript" | "certificate";
  title: string;
  institution: string;
  issueDate: string;
  status: "active" | "pending" | "revoked";
  gpa?: string;
  grade?: string;
  blockchainHash?: string;
  verificationCount: number;
}

const MyCredentials: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [filteredInfo, setFilteredInfo] = useState<
    Record<string, string | null>
  >({});
  const [sortedInfo, setSortedInfo] = useState<{
    columnKey?: string;
    order?: string;
  }>({});

  // Mock data - Comprehensive credentials list
  const credentialsData: CredentialData[] = [
    {
      key: "1",
      id: "deg_001",
      type: "degree",
      title: "Bachelor of Software Engineering",
      institution: "FPT University",
      issueDate: "2024-06-15",
      status: "active",
      gpa: "3.85",
      blockchainHash: "0x1a2b3c4d5e6f7890abcdef",
      verificationCount: 15,
    },
    {
      key: "2",
      id: "cert_001",
      type: "certificate",
      title: "AWS Cloud Practitioner",
      institution: "Amazon Web Services",
      issueDate: "2024-03-22",
      status: "active",
      blockchainHash: "0x5e6f7g8h9i0j1k2l3m4n5o",
      verificationCount: 8,
    },
    {
      key: "3",
      id: "trans_001",
      type: "transcript",
      title: "Academic Transcript - Fall 2023",
      institution: "FPT University",
      issueDate: "2024-01-10",
      status: "active",
      gpa: "3.75",
      blockchainHash: "0x9i0j1k2l3m4n5o6p7q8r9s",
      verificationCount: 12,
    },
    {
      key: "4",
      id: "cert_002",
      type: "certificate",
      title: "React Advanced Certification",
      institution: "Meta",
      issueDate: "2024-02-28",
      status: "pending",
      verificationCount: 0,
    },
    {
      key: "5",
      id: "trans_002",
      type: "transcript",
      title: "Academic Transcript - Spring 2023",
      institution: "FPT University",
      issueDate: "2023-06-20",
      status: "active",
      gpa: "3.60",
      blockchainHash: "0xa1b2c3d4e5f6789012345",
      verificationCount: 18,
    },
    {
      key: "6",
      id: "cert_003",
      type: "certificate",
      title: "Google Cloud Professional",
      institution: "Google Cloud",
      issueDate: "2023-11-15",
      status: "active",
      blockchainHash: "0xf6789012345a1b2c3d4e5",
      verificationCount: 6,
    },
    {
      key: "7",
      id: "cert_004",
      type: "certificate",
      title: "Microsoft Azure Fundamentals",
      institution: "Microsoft",
      issueDate: "2023-09-10",
      status: "active",
      blockchainHash: "0x12345a1b2c3d4e5f67890",
      verificationCount: 4,
    },
    {
      key: "8",
      id: "trans_003",
      type: "transcript",
      title: "Academic Transcript - Fall 2022",
      institution: "FPT University",
      issueDate: "2023-01-15",
      status: "active",
      gpa: "3.45",
      blockchainHash: "0xa1b2c3d4e5f678901234567",
      verificationCount: 9,
    },
  ];

  const getCredentialIcon = (type: string) => {
    switch (type) {
      case "degree":
        return <TrophyOutlined style={{ color: "#52c41a" }} />;
      case "certificate":
        return <SafetyCertificateOutlined style={{ color: "#1890ff" }} />;
      case "transcript":
        return <BookOutlined style={{ color: "#722ed1" }} />;
      default:
        return <FileTextOutlined style={{ color: "#8c8c8c" }} />;
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case "active":
        return <Tag color="success">Active</Tag>;
      case "pending":
        return <Tag color="warning">Pending</Tag>;
      case "revoked":
        return <Tag color="error">Revoked</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  const handleTableChange: TableProps<CredentialData>["onChange"] = (
    pagination,
    filters,
    sorter
  ) => {
    setFilteredInfo(filters || {});
    setSortedInfo(sorter as { columnKey?: string; order?: string });
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleReset = () => {
    setFilteredInfo({});
    setSortedInfo({});
    setSearchText("");
  };

  const handleViewDetail = (credentialId: string) => {
    navigate(`/student-portal/credentials/${credentialId}`);
  };

  // Filter data based on search text
  const filteredData = credentialsData.filter(
    (item) =>
      item.title.toLowerCase().includes(searchText.toLowerCase()) ||
      item.institution.toLowerCase().includes(searchText.toLowerCase()) ||
      item.type.toLowerCase().includes(searchText.toLowerCase())
  );

  // Statistics
  const stats = {
    total: credentialsData.length,
    degrees: credentialsData.filter((c) => c.type === "degree").length,
    certificates: credentialsData.filter((c) => c.type === "certificate")
      .length,
    transcripts: credentialsData.filter((c) => c.type === "transcript").length,
    active: credentialsData.filter((c) => c.status === "active").length,
    pending: credentialsData.filter((c) => c.status === "pending").length,
  };

  const columns: TableColumnsType<CredentialData> = [
    {
      title: "Credential",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      sortOrder:
        sortedInfo.columnKey === "title" ? (sortedInfo.order as any) : null,
      render: (text, record) => (
        <Space>
          <Avatar icon={getCredentialIcon(record.type)} />
          <div>
            <div>
              <Text strong>{text}</Text>
              {record.gpa && (
                <Tag color="gold" style={{ marginLeft: 8 }}>
                  GPA: {record.gpa}
                </Tag>
              )}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.institution}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      filters: [
        { text: "Degree", value: "degree" },
        { text: "Certificate", value: "certificate" },
        { text: "Transcript", value: "transcript" },
      ],
      filteredValue: filteredInfo.type || null,
      onFilter: (value, record) => record.type === value,
      render: (type) => {
        const config = {
          degree: { color: "green", text: "Degree" },
          certificate: { color: "blue", text: "Certificate" },
          transcript: { color: "purple", text: "Transcript" },
        };
        return (
          <Tag color={config[type as keyof typeof config].color}>
            {config[type as keyof typeof config].text}
          </Tag>
        );
      },
    },
    {
      title: "Issue Date",
      dataIndex: "issueDate",
      key: "issueDate",
      sorter: (a, b) =>
        new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime(),
      sortOrder:
        sortedInfo.columnKey === "issueDate" ? (sortedInfo.order as any) : null,
      render: (date) => (
        <Space>
          <CalendarOutlined style={{ color: "#8c8c8c" }} />
          {dayjs(date).format("MMM DD, YYYY")}
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Active", value: "active" },
        { text: "Pending", value: "pending" },
        { text: "Revoked", value: "revoked" },
      ],
      filteredValue: filteredInfo.status || null,
      onFilter: (value, record) => record.status === value,
      render: (status) => getStatusTag(status),
    },
    {
      title: "Verification",
      key: "verification",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <div>
            {record.blockchainHash && (
              <Tooltip title={`Blockchain: ${record.blockchainHash}`}>
                <Badge dot color="green">
                  <LinkOutlined style={{ color: "#52c41a" }} />
                </Badge>
              </Tooltip>
            )}
            <Text style={{ marginLeft: 8, fontSize: 12 }}>
              {record.verificationCount} verifications
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record.id)}
          >
            View
          </Button>
          <Button
            type="text"
            size="small"
            icon={<ShareAltOutlined />}
            onClick={() => navigate("/student-portal/share")}
          >
            Share
          </Button>
          <Button type="text" size="small" icon={<DownloadOutlined />}>
            Download
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="my-credentials">
      {/* Page Header */}
      <div className="page-header">
        <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
          My Credentials
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          View and manage all your academic credentials
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total"
              value={stats.total}
              prefix={<FileTextOutlined style={{ color: "#1890ff" }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Degrees"
              value={stats.degrees}
              prefix={<TrophyOutlined style={{ color: "#52c41a" }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Certificates"
              value={stats.certificates}
              prefix={
                <SafetyCertificateOutlined style={{ color: "#1890ff" }} />
              }
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Transcripts"
              value={stats.transcripts}
              prefix={<BookOutlined style={{ color: "#722ed1" }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Search
              placeholder="Search credentials..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Filter by type"
              style={{ width: "100%" }}
              size="large"
              allowClear
              onChange={(value) => {
                setFilteredInfo({
                  ...filteredInfo,
                  type: value ? [value] : null,
                });
              }}
            >
              <Option value="degree">Degrees</Option>
              <Option value="certificate">Certificates</Option>
              <Option value="transcript">Transcripts</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Filter by status"
              style={{ width: "100%" }}
              size="large"
              allowClear
              onChange={(value) => {
                setFilteredInfo({
                  ...filteredInfo,
                  status: value ? [value] : null,
                });
              }}
            >
              <Option value="active">Active</Option>
              <Option value="pending">Pending</Option>
              <Option value="revoked">Revoked</Option>
            </Select>
          </Col>
          <Col xs={24} md={4}>
            <Button
              size="large"
              icon={<FilterOutlined />}
              onClick={handleReset}
              style={{ width: "100%" }}
            >
              Reset
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Credentials Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          onChange={handleTableChange}
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} credentials`,
          }}
          scroll={{ x: 800 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default MyCredentials;
