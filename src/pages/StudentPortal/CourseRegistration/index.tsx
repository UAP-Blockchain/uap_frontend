import React, { useState, useMemo } from "react";
import {
  AutoComplete,
  Button,
  Card,
  Empty,
  Input,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import {
  SearchOutlined,
  BookOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { searchSubjects } from "../../../services/student/subject.service";
import type { SubjectDto } from "../../../types/Subject";
import "./CourseRegistration.scss";

const { Title, Text, Paragraph } = Typography;

const CourseRegistration: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchValue] = useState<string>("");
  const [options, setOptions] = useState<
    Array<{ value: string; label: React.ReactNode; subject: SubjectDto }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectDto | null>(
    null
  );

  // Get courseCode from location state (from roadmap)
  const courseCodeFromState = useMemo(() => {
    return (location.state as { courseCode?: string })?.courseCode;
  }, [location.state]);

  // Auto search if courseCode is provided from roadmap
  React.useEffect(() => {
    if (courseCodeFromState) {
      setSearchValue(courseCodeFromState);
      handleSearch(courseCodeFromState);
    }
  }, [courseCodeFromState]);

  const handleSearch = async (value: string) => {
    if (!value || value.trim().length < 2) {
      setOptions([]);
      setSelectedSubject(null);
      return;
    }

    setIsSearching(true);
    try {
      const subjects = await searchSubjects(value.trim());
      const newOptions = subjects.map((subject) => ({
        value: `${subject.subjectCode} - ${subject.subjectName}`,
        label: (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <Text strong style={{ color: "#1a94fc" }}>
                {subject.subjectCode}
              </Text>
              <Text style={{ marginLeft: 8, color: "#64748b" }}>
                {subject.subjectName}
              </Text>
            </div>
            <Tag color="blue">{subject.credits} tín chỉ</Tag>
          </div>
        ),
        subject,
      }));
      setOptions(newOptions);
    } catch (error) {
      message.error("Không thể tìm kiếm môn học. Vui lòng thử lại.");
      setOptions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (value: string, option: { subject: SubjectDto }) => {
    setSelectedSubject(option.subject);
    setSearchValue(value);
  };

  const handleRegister = () => {
    if (!selectedSubject) {
      message.warning("Vui lòng chọn môn học trước khi đăng ký");
      return;
    }

    navigate("/student-portal/enroll-list", {
      state: {
        subjectId: selectedSubject.id,
        subjectCode: selectedSubject.subjectCode,
        subjectName: selectedSubject.subjectName,
        from: "course-registration",
      },
    });
  };

  return (
    <div className="course-registration-page">
      <div className="registration-header">
        <div className="header-content">
          <div className="header-title-section">
            <Text className="header-eyebrow">ĐĂNG KÝ MÔN HỌC</Text>
            <Title level={2} style={{ margin: 0, color: "#ffffff" }}>
              Tìm kiếm và đăng ký môn học
            </Title>
            <Text className="header-description">
              Nhập mã môn học hoặc tên môn học để tìm kiếm và đăng ký
            </Text>
          </div>
        </div>
      </div>

      <Card className="search-card">
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          <div>
            <Text
              strong
              style={{ fontSize: "16px", display: "block", marginBottom: 12 }}
            >
              Tìm kiếm môn học
            </Text>
            <AutoComplete
              value={searchValue}
              options={options}
              onSearch={handleSearch}
              onSelect={handleSelect}
              style={{ width: "100%" }}
              size="large"
              notFoundContent={
                isSearching ? (
                  <Spin size="small" />
                ) : (
                  <Empty description="Không tìm thấy môn học" />
                )
              }
              filterOption={false}
            >
              <Input
                prefix={<SearchOutlined style={{ color: "#1a94fc" }} />}
                placeholder="Nhập mã môn học hoặc tên môn học (ví dụ: SE101 hoặc Introduction to Software Engineering)"
                allowClear
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  if (!e.target.value) {
                    setSelectedSubject(null);
                    setOptions([]);
                  }
                }}
              />
            </AutoComplete>
          </div>

          {selectedSubject && (
            <Card className="subject-info-card">
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <Space size={12} align="center" style={{ marginBottom: 8 }}>
                      <BookOutlined
                        style={{ fontSize: "20px", color: "#1a94fc" }}
                      />
                      <Text
                        strong
                        style={{ fontSize: "18px", color: "#1a94fc" }}
                      >
                        {selectedSubject.subjectCode}
                      </Text>
                      <Tag
                        color="blue"
                        style={{ fontSize: "13px", padding: "4px 12px" }}
                      >
                        {selectedSubject.credits} tín chỉ
                      </Tag>
                    </Space>
                    <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
                      {selectedSubject.subjectName}
                    </Title>
                    {selectedSubject.description && (
                      <Paragraph type="secondary" style={{ margin: 0 }}>
                        {selectedSubject.description}
                      </Paragraph>
                    )}
                  </div>
                  <CheckCircleOutlined
                    style={{ fontSize: "24px", color: "#10b981" }}
                  />
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handleRegister}
                  style={{
                    background: "linear-gradient(135deg, #1a94fc, #0ea5e9)",
                    border: "none",
                    borderRadius: "12px",
                    height: "48px",
                    fontWeight: 600,
                    fontSize: "16px",
                    boxShadow: "0 4px 12px rgba(26, 148, 252, 0.3)",
                  }}
                >
                  Xem danh sách lớp học và đăng ký
                </Button>
              </Space>
            </Card>
          )}

          {!selectedSubject &&
            searchValue &&
            options.length === 0 &&
            !isSearching && (
              <Card className="empty-state-card">
                <Empty
                  description={
                    <Text type="secondary">
                      Không tìm thấy môn học nào với từ khóa "{searchValue}".
                      Vui lòng thử lại với từ khóa khác.
                    </Text>
                  }
                />
              </Card>
            )}
        </Space>
      </Card>
    </div>
  );
};

export default CourseRegistration;
