import { Breadcrumb, Layout } from "antd";
import React, { useEffect, useRef, useState } from "react";

import { Link, useLocation } from "react-router-dom";
import HeaderComponent from "./header";
import "./index.scss";
import SiderComponent from "./siderAdmin";
import { getUserByIdApi } from "../services/admin/users/api";
import { getSemesterByIdApi } from "../services/admin/semesters/api";
import {
  getCredentialByIdApi,
  getCredentialRequestByIdApi,
} from "../services/admin/credentials/api";

const { Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
  breadcrumbItems?: { title: string; href?: string }[];
  title?: string;
  subtitle?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  breadcrumbItems,
}) => {
  const [collapsed, setCollapsed] = useState(true);
  const location = useLocation();
  const pathname = location.pathname;
  const [userNameMap, setUserNameMap] = useState<Record<string, string>>({});
  const [semesterNameMap, setSemesterNameMap] = useState<
    Record<string, string>
  >({});
  const [credentialNameMap, setCredentialNameMap] = useState<
    Record<string, string>
  >({});
  const [credentialRequestNameMap, setCredentialRequestNameMap] = useState<
    Record<string, string>
  >({});
  const fetchingRef = useRef<Set<string>>(new Set());

  // Helper function to check if a string looks like a UUID
  const isUUID = (str: string): boolean => {
    // UUID pattern: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (36 chars)
    // or xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (32 chars, no dashes)
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const uuidPatternNoDash = /^[0-9a-f]{32}$/i;
    return uuidPattern.test(str) || uuidPatternNoDash.test(str);
  };

  // Fetch user name when userId is detected in path
  useEffect(() => {
    const paths = pathname?.split("/").filter(Boolean) || [];

    // Check if path is /admin/user-management/:userId or /admin/users/:userId
    if (
      paths.length >= 3 &&
      paths[0] === "admin" &&
      (paths[1] === "user-management" || paths[1] === "users")
    ) {
      const userId = paths[2];

      // Check if it's a UUID and not already fetched or currently fetching
      if (
        isUUID(userId) &&
        !userNameMap[userId] &&
        !fetchingRef.current.has(`user-${userId}`)
      ) {
        fetchingRef.current.add(`user-${userId}`);

        getUserByIdApi(userId)
          .then((user) => {
            setUserNameMap((prev) => ({
              ...prev,
              [userId]: user.fullName || user.email || userId,
            }));
            fetchingRef.current.delete(`user-${userId}`);
          })
          .catch((error) => {
            console.error("Failed to fetch user for breadcrumb:", error);
            // Fallback to userId if fetch fails
            setUserNameMap((prev) => ({
              ...prev,
              [userId]: userId,
            }));
            fetchingRef.current.delete(`user-${userId}`);
          });
      }
    }

    // Check if path is /admin/semesters/:semesterId
    if (paths.length >= 3 && paths[0] === "admin" && paths[1] === "semesters") {
      const semesterId = paths[2];

      // Check if it's a UUID and not already fetched or currently fetching
      if (
        isUUID(semesterId) &&
        !semesterNameMap[semesterId] &&
        !fetchingRef.current.has(`semester-${semesterId}`)
      ) {
        fetchingRef.current.add(`semester-${semesterId}`);

        getSemesterByIdApi(semesterId)
          .then((semester) => {
            setSemesterNameMap((prev) => ({
              ...prev,
              [semesterId]: semester.name || semesterId,
            }));
            fetchingRef.current.delete(`semester-${semesterId}`);
          })
          .catch((error) => {
            console.error("Failed to fetch semester for breadcrumb:", error);
            // Fallback to semesterId if fetch fails
            setSemesterNameMap((prev) => ({
              ...prev,
              [semesterId]: semesterId,
            }));
            fetchingRef.current.delete(`semester-${semesterId}`);
          });
      }
    }

    // Check if path is /admin/credentials/:credentialId
    if (
      paths.length >= 3 &&
      paths[0] === "admin" &&
      paths[1] === "credentials"
    ) {
      const credentialId = paths[2];

      // Check if it's a UUID and not already fetched or currently fetching
      if (
        isUUID(credentialId) &&
        !credentialNameMap[credentialId] &&
        !fetchingRef.current.has(`credential-${credentialId}`)
      ) {
        fetchingRef.current.add(`credential-${credentialId}`);

        getCredentialByIdApi(credentialId)
          .then((credential) => {
            // Use subjectName, semesterName, roadmapName, or certificateType as fallback
            const credentialName =
              credential.subjectName ||
              credential.semesterName ||
              credential.roadmapName ||
              credential.certificateType ||
              credentialId;
            setCredentialNameMap((prev) => ({
              ...prev,
              [credentialId]: credentialName,
            }));
            fetchingRef.current.delete(`credential-${credentialId}`);
          })
          .catch((error) => {
            console.error("Failed to fetch credential for breadcrumb:", error);
            // Fallback to credentialId if fetch fails
            setCredentialNameMap((prev) => ({
              ...prev,
              [credentialId]: credentialId,
            }));
            fetchingRef.current.delete(`credential-${credentialId}`);
          });
      }
    }

    // Check if path is /admin/credential-requests/:requestId
    if (
      paths.length >= 3 &&
      paths[0] === "admin" &&
      paths[1] === "credential-requests"
    ) {
      const requestId = paths[2];

      // Check if it's a UUID and not already fetched or currently fetching
      if (
        isUUID(requestId) &&
        !credentialRequestNameMap[requestId] &&
        !fetchingRef.current.has(`credential-request-${requestId}`)
      ) {
        fetchingRef.current.add(`credential-request-${requestId}`);

        getCredentialRequestByIdApi(requestId)
          .then((request) => {
            // Use subjectName, semesterName, roadmapName, or studentName + certificateType as fallback
            const requestName =
              request.subjectName ||
              request.semesterName ||
              request.roadmapName ||
              `${request.studentName} - ${request.certificateType}` ||
              requestId;
            setCredentialRequestNameMap((prev) => ({
              ...prev,
              [requestId]: requestName,
            }));
            fetchingRef.current.delete(`credential-request-${requestId}`);
          })
          .catch((error) => {
            console.error(
              "Failed to fetch credential request for breadcrumb:",
              error
            );
            // Fallback to requestId if fetch fails
            setCredentialRequestNameMap((prev) => ({
              ...prev,
              [requestId]: requestId,
            }));
            fetchingRef.current.delete(`credential-request-${requestId}`);
          });
      }
    }
  }, [
    pathname,
    userNameMap,
    semesterNameMap,
    credentialNameMap,
    credentialRequestNameMap,
  ]);

  // Generate default breadcrumb items based on the current path if not provided
  const generateDefaultBreadcrumbs = () => {
    if (breadcrumbItems) {
      return breadcrumbItems.map((item) => ({
        title: item.href ? (
          <Link to={item.href}>{item.title}</Link>
        ) : (
          item.title
        ),
      }));
    }

    const paths = pathname?.split("/").filter(Boolean) || [];

    // Route name mapping (Vietnamese)
    const routeNameMap: Record<string, string> = {
      admin: "Quản trị",
      "student-portal": "Cổng sinh viên",
      teacher: "Cổng giảng viên",
      dashboard: "Bảng điều khiển",
      roadmap: "Lộ trình học tập",
      credentials: "Quản lý Chứng chỉ",
      "credential-requests": "Đơn yêu cầu chứng chỉ",
      "request-credential": "Yêu cầu chứng chỉ",
      timetable: "Thời khóa biểu",
      "attendance-report": "Báo cáo điểm danh",
      "grade-report": "Báo cáo điểm",
      profile: "Hồ sơ",
      share: "Cổng chia sẻ",
      "course-registration": "Đăng ký môn học",
      "class-list": "Danh sách lớp",
      activity: "Chi tiết hoạt động",
      instructor: "Chi tiết giảng viên",
      "credential-detail": "Chi tiết chứng chỉ",
      "my-credentials": "Chứng chỉ của tôi",
      users: "Người dùng",
      "user-management": "Quản lý Người dùng",
      "bulk-register": "Đăng ký hàng loạt",
      register: "Đăng ký",
      curriculums: "Khung chương trình",
      subjects: "Môn học",
      specializations: "Chuyên ngành",
      semesters: "Học kỳ",
      slots: "Ca học",
      classes: "Lớp học",
      teachers: "Giảng viên",
      students: "Sinh viên",
      "attendance-validation": "Cấu hình",
      schedule: "Lịch giảng dạy",
      grading: "Chấm điểm",
    };

    // For student-portal routes, create breadcrumb with "Cổng sinh viên" as first item
    if (paths[0] === "student-portal") {
      const breadcrumbs: Array<{ title: React.ReactNode }> = [
        {
          title: <Link to="/student-portal">Cổng sinh viên</Link>,
        },
      ];

      // If only student-portal, add Bảng điều khiển
      if (paths.length === 1) {
        breadcrumbs.push({
          title: "Bảng điều khiển",
        });
      } else {
        // Add sub-routes
        let subPaths = paths.slice(1);

        // Special case: /student-portal/activity/:id
        // Breadcrumb chỉ hiển thị "Chi tiết hoạt động", không thêm ID slot
        if (subPaths.length >= 2 && subPaths[0] === "activity") {
          subPaths = subPaths.slice(0, 1);
        }

        // Special case: /student-portal/credentials/:id
        // Breadcrumb chỉ hiển thị "Quản lý Chứng chỉ", không thêm ID
        if (subPaths.length >= 2 && subPaths[0] === "credentials") {
          subPaths = subPaths.slice(0, 1);
        }

        subPaths.forEach((path, index) => {
          const href = "/" + paths.slice(0, index + 2).join("/");
          const displayName =
            routeNameMap[path] ||
            path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
          breadcrumbs.push({
            title:
              index === subPaths.length - 1 ? (
                displayName
              ) : (
                <Link to={href}>{displayName}</Link>
              ),
          });
        });
      }
      return breadcrumbs;
    }

    // For teacher routes, create breadcrumb with "Cổng giảng viên" as first item
    if (paths[0] === "teacher") {
      const breadcrumbs: Array<{ title: React.ReactNode }> = [
        {
          title: <Link to="/teacher">Cổng giảng viên</Link>,
        },
      ];

      // If only teacher, redirect to schedule (handled by route), so show schedule
      if (paths.length === 1) {
        breadcrumbs.push({
          title: "Lịch giảng dạy",
        });
      } else {
        // Add sub-routes
        let subPaths = paths.slice(1);

        // Special case: /teacher/class-list/:courseCode
        // Breadcrumb chỉ hiển thị "Danh sách lớp", không thêm courseCode
        if (subPaths.length >= 2 && subPaths[0] === "class-list") {
          subPaths = subPaths.slice(0, 1);
          subPaths[0] = "class-list"; // Keep "class-list" for mapping
        }

        subPaths.forEach((path, index) => {
          const href = "/" + paths.slice(0, index + 2).join("/");
          let displayName =
            routeNameMap[path] ||
            path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");

          // Special case: "classes" in teacher context should be "Lớp giảng dạy"
          if (path === "classes") {
            displayName = "Lớp giảng dạy";
          }

          breadcrumbs.push({
            title:
              index === subPaths.length - 1 ? (
                displayName
              ) : (
                <Link to={href}>{displayName}</Link>
              ),
          });
        });
      }
      return breadcrumbs;
    }

    // Default breadcrumb generation for other routes
    return paths.map((path, index) => {
      const href = "/" + paths.slice(0, index + 1).join("/");

      // Check if this is a UUID and we have the name mapped
      let displayName: string;
      if (isUUID(path)) {
        // Check context: if previous path is "user-management" or "users", use userNameMap
        if (
          index > 0 &&
          (paths[index - 1] === "user-management" ||
            paths[index - 1] === "users") &&
          userNameMap[path]
        ) {
          displayName = userNameMap[path];
        }
        // Check context: if previous path is "semesters", use semesterNameMap
        else if (
          index > 0 &&
          paths[index - 1] === "semesters" &&
          semesterNameMap[path]
        ) {
          displayName = semesterNameMap[path];
        }
        // Check context: if previous path is "credentials", use credentialNameMap
        else if (
          index > 0 &&
          paths[index - 1] === "credentials" &&
          credentialNameMap[path]
        ) {
          displayName = credentialNameMap[path];
        }
        // Check context: if previous path is "credential-requests", use credentialRequestNameMap
        else if (
          index > 0 &&
          paths[index - 1] === "credential-requests" &&
          credentialRequestNameMap[path]
        ) {
          displayName = credentialRequestNameMap[path];
        }
        // Fallback: try all maps (shouldn't happen, but safe)
        else if (userNameMap[path]) {
          displayName = userNameMap[path];
        } else if (semesterNameMap[path]) {
          displayName = semesterNameMap[path];
        } else if (credentialNameMap[path]) {
          displayName = credentialNameMap[path];
        } else if (credentialRequestNameMap[path]) {
          displayName = credentialRequestNameMap[path];
        } else {
          // UUID but no mapping yet, use default formatting
          displayName =
            path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
        }
      } else if (routeNameMap[path]) {
        displayName = routeNameMap[path];
      } else {
        // Default formatting
        displayName =
          path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
      }

      const isLast = index === paths.length - 1;

      return {
        title: isLast ? displayName : <Link to={href}>{displayName}</Link>,
      };
    });
  };

  const items = generateDefaultBreadcrumbs();

  // Render the layout with a stable structure for both server and client
  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      <HeaderComponent collapsed={collapsed} setCollapsed={setCollapsed} />

      <Layout>
        <SiderComponent collapsed={collapsed} />

        <Layout
          style={{
            marginLeft: collapsed ? 80 : 240,
            marginTop: 54,
            transition: "margin 0.2s",
          }}
        >
          <Content className="admin-content-wrapper">
            {/* Breadcrumb navigation */}
            <div style={{ marginBottom: 16 }}>
              <Breadcrumb items={items} />

              {/* {(title || subtitle) && (
                <div className="page-title-section">
                  {title && <h1 className="page-title">{title}</h1>}
                  {subtitle && <p className="page-subtitle">{subtitle}</p>}
                </div>
              )} */}
            </div>

            <div className="content-container">{children}</div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
