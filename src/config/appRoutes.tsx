/**
 * Application Route Configurations
 * Centralized route definitions with menu metadata
 * Using React.lazy() for code splitting and performance optimization
 */

import {
  AppstoreOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DashboardOutlined,
  EditOutlined,
  FileTextOutlined,
  FlagOutlined,
  HomeOutlined,
  IdcardOutlined,
  RiseOutlined,
  ScheduleOutlined,
  ShareAltOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { lazy } from "react";
import { Navigate, Outlet } from "react-router-dom";
import type { Permission, RoleCode } from "../constants/roles";
import { PERMISSIONS, ROLE_CODES } from "../constants/roles";
import AdminLayout from "../layout";
import PublicPortalLayout from "../layout/PublicPortalLayout";

// Lazy load all page components for code splitting
const ClassesManagement = lazy(() => import("../pages/admin/classes"));
const ClassDetail = lazy(() => import("../pages/admin/classes/ClassDetail"));
const SubjectsManagement = lazy(() => import("../pages/admin/subjects"));
const SubjectDetail = lazy(
  () => import("../pages/admin/subjects/SubjectDetail")
);
const CredentialsManagement = lazy(() => import("../pages/admin/credentials"));
const CredentialDetailAdmin = lazy(
  () => import("../pages/admin/credentials/CredentialDetail")
);
const CredentialRequestsPage = lazy(
  () => import("../pages/admin/credentialRequests")
);
const CredentialRequestDetailAdmin = lazy(
  () => import("../pages/admin/credentialRequests/RequestDetail")
);
const CurriculumManagement = lazy(() => import("../pages/admin/curriculums"));
const CurriculumDetail = lazy(
  () => import("../pages/admin/curriculums/CurriculumDetail")
);
const SpecializationsPage = lazy(
  () => import("../pages/admin/specializations")
);
const RegisterUser = lazy(() => import("../pages/admin/registerUser"));
const RegisterUserDetail = lazy(
  () => import("../pages/admin/registerUser/detail")
);
const BulkRegister = lazy(() => import("../pages/admin/bulkRegister"));
const AttendanceValidationAdminPage = lazy(
  () => import("../pages/admin/attendanceValidation")
);
const SemestersManagement = lazy(() => import("../pages/admin/semesters"));
const SemesterDetail = lazy(
  () => import("../pages/admin/semesters/SemesterDetail")
);
const TimeSlotsManagement = lazy(() => import("../pages/admin/slots"));
const AboutHelp = lazy(() => import("../pages/PublicPortal/AboutHelp"));
const PublicHome = lazy(() => import("../pages/PublicPortal/Home"));
const VerificationHistory = lazy(
  () => import("../pages/PublicPortal/VerificationHistory")
);
const VerificationPortal = lazy(
  () => import("../pages/PublicPortal/VerificationPortal")
);
const VerificationResults = lazy(
  () => import("../pages/PublicPortal/VerificationResults")
);
const ActivityDetail = lazy(
  () => import("../pages/StudentPortal/ActivityDetail")
);
const AttendanceReport = lazy(
  () => import("../pages/StudentPortal/AttendanceReport")
);
const ClassStudentList = lazy(
  () => import("../pages/StudentPortal/ClassStudentList")
);
const CourseRegistration = lazy(
  () => import("../pages/StudentPortal/CourseRegistration")
);
const EnrollList = lazy(() => import("../pages/StudentPortal/EnrollList"));
const CredentialDetail = lazy(
  () => import("../pages/StudentPortal/CredentialDetail")
);
const Dashboard = lazy(() => import("../pages/StudentPortal/Dashboard"));
const GradeReport = lazy(() => import("../pages/StudentPortal/GradeReport"));
const InstructorDetail = lazy(
  () => import("../pages/StudentPortal/InstructorDetail")
);
const MyCredentials = lazy(
  () => import("../pages/StudentPortal/MyCredentials")
);
const RequestCredential = lazy(
  () => import("../pages/StudentPortal/RequestCredential")
);
const Profile = lazy(() => import("../pages/StudentPortal/Profile"));
const Roadmap = lazy(() => import("../pages/StudentPortal/Roadmap"));
const SharePortal = lazy(() => import("../pages/StudentPortal/SharePortal"));
const WeeklyTimetable = lazy(
  () => import("../pages/StudentPortal/WeeklyTimetable")
);
const TeacherClassStudentList = lazy(
  () => import("../pages/teacher/classList")
);
const TeacherTeachingClasses = lazy(() => import("../pages/teacher/classes"));
const TeacherGrading = lazy(() => import("../pages/teacher/grading"));

const TeacherSchedule = lazy(() => import("../pages/teacher/schedule"));
const TeacherProfile = lazy(() => import("../pages/teacher/profile"));

// Extended Route Config with Menu Metadata
export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  children?: RouteConfig[];
  errorElement?: React.ReactNode;
  // Menu metadata
  menuLabel?: string;
  menuIcon?: React.ReactNode;
  showInMenu?: boolean;
  allowedRoles?: RoleCode[];
  requiredPermissions?: Permission[];
  menuIndex?: number;
  menuSection?: "main" | "student" | "tools";
}

// Admin Routes with Menu Config
export const adminRoutes: RouteConfig = {
  path: "/admin",
  element: (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  ),
  children: [
    {
      path: "/admin",
      element: <Dashboard />,
      menuLabel: "Tổng quan hệ thống",
      menuIcon: <DashboardOutlined />,
      showInMenu: true,
      menuIndex: 0,
      menuSection: "main",
      // Dashboard for admin roles only (not student)
      allowedRoles: [ROLE_CODES.ADMIN],
    },
    {
      path: "/admin/dashboard",
      element: <Dashboard />,
      showInMenu: false,
    },
    {
      path: "/admin/subjects",
      element: <SubjectsManagement />,
      menuLabel: "Quản lý Môn học",
      menuIcon: <BookOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.ADMIN],
      menuIndex: 2,
      menuSection: "main",
    },
    {
      path: "/admin/specializations",
      element: <SpecializationsPage />,
      menuLabel: "Quản lý Chuyên môn",
      menuIcon: <FlagOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.ADMIN],
      menuIndex: 2.2,
      menuSection: "main",
    },
    {
      path: "/admin/subjects/:subjectCode",
      element: <SubjectDetail />,
      showInMenu: false,
      allowedRoles: [ROLE_CODES.ADMIN],
    },
    {
      path: "/admin/semesters",
      element: <SemestersManagement />,
      menuLabel: "Quản lý Học kì",
      menuIcon: <CalendarOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.ADMIN],
      menuIndex: 2.5,
      menuSection: "main",
    },

    {
      path: "/admin/slots",
      element: <TimeSlotsManagement />,
      menuLabel: "Quản lý Ca học",
      menuIcon: <ScheduleOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.ADMIN, ROLE_CODES.MANAGER],
      menuIndex: 3.2,
      menuSection: "main",
    },
    {
      path: "/admin/classes",
      element: <ClassesManagement />,
      menuLabel: "Quản lý Lớp học",
      menuIcon: <BookOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.ADMIN, ROLE_CODES.MANAGER],
      requiredPermissions: [PERMISSIONS.MANAGE_CLASSES],
      menuIndex: 3,
      menuSection: "main",
    },
    {
      path: "/admin/curriculums",
      element: <CurriculumManagement />,
      menuLabel: "Quản lý Khung chương trình",
      menuIcon: <AppstoreOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.ADMIN, ROLE_CODES.MANAGER],
      menuIndex: 3.5,
      menuSection: "main",
    },
    {
      path: "/admin/curriculums/:id",
      element: <CurriculumDetail />,
      showInMenu: false,
      allowedRoles: [ROLE_CODES.ADMIN, ROLE_CODES.MANAGER],
    },
    {
      path: "/admin/classes/:classCode",
      element: <ClassDetail />,
      showInMenu: false,
      allowedRoles: [ROLE_CODES.ADMIN],
    },

    {
      path: "/admin/semesters/:semesterId",
      element: <SemesterDetail />,
      showInMenu: false,
      allowedRoles: [ROLE_CODES.ADMIN],
    },
    {
      path: "/admin/credentials",
      element: <CredentialsManagement />,
      menuLabel: "Quản lý Chứng chỉ",
      menuIcon: <TrophyOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.ADMIN],
      requiredPermissions: [PERMISSIONS.MANAGE_CREDENTIALS],
      menuIndex: 0,
      menuSection: "tools",
    },
    {
      path: "/admin/credentials/:credentialId",
      element: <CredentialDetailAdmin />,
      showInMenu: false,
      allowedRoles: [ROLE_CODES.ADMIN, ROLE_CODES.MANAGER],
      requiredPermissions: [PERMISSIONS.MANAGE_CREDENTIALS],
    },
    {
      path: "/admin/credential-requests",
      element: <CredentialRequestsPage />,
      menuLabel: "Đơn yêu cầu chứng chỉ",
      menuIcon: <FileTextOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.ADMIN],
      requiredPermissions: [PERMISSIONS.MANAGE_CREDENTIALS],
      menuIndex: 0.5,
      menuSection: "tools",
    },
    {
      path: "/admin/credential-requests/:requestId",
      element: <CredentialRequestDetailAdmin />,
      showInMenu: false,
      allowedRoles: [ROLE_CODES.ADMIN],
      requiredPermissions: [PERMISSIONS.MANAGE_CREDENTIALS],
    },
    // {
    //   path: "/admin/blockchain",
    //   element: <ReportsManagement />,
    //   menuLabel: "Giám sát Blockchain",
    //   menuIcon: <BellOutlined />,
    //   showInMenu: true,
    //   allowedRoles: [ROLE_CODES.ADMIN],
    //   menuIndex: 1,
    //   menuSection: "tools",
    // },
    // {
    //   path: "/admin/reports",
    //   element: <ReportsManagement />,
    //   menuLabel: "Báo cáo & Thống kê",
    //   menuIcon: <FileTextOutlined />,
    //   showInMenu: true,
    //   allowedRoles: [ROLE_CODES.ADMIN],
    //   requiredPermissions: [PERMISSIONS.VIEW_REPORTS],
    //   menuIndex: 2,
    //   menuSection: "tools",
    // },
    // {
    //   path: "/admin/security",
    //   element: <SecurityManagement />,
    //   menuLabel: "Bảo mật & Xác thực",
    //   menuIcon: <SettingOutlined />,
    //   showInMenu: true,
    //   allowedRoles: [ROLE_CODES.ADMIN], // Only admin
    //   menuIndex: 3,
    //   menuSection: "tools",
    // },
    {
      path: "/admin/user-management",
      element: <RegisterUser />,
      menuLabel: "Quản lý Người dùng",
      menuIcon: <UserOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.ADMIN],
      menuIndex: 5,
      menuSection: "main",
    },
    {
      path: "/admin/user-management/:userId",
      element: <RegisterUserDetail />,
      showInMenu: false,
      allowedRoles: [ROLE_CODES.ADMIN],
    },
    {
      path: "/admin/bulk-register",
      element: <BulkRegister />,
      menuLabel: "Đăng ký hàng loạt",
      menuIcon: <TeamOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.ADMIN],
      menuIndex: 6,
      menuSection: "main",
    },
    {
      path: "/admin/attendance-validation",
      element: <AttendanceValidationAdminPage />,
      menuLabel: "Cấu hình ngày điểm danh",
      menuIcon: <CheckCircleOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.ADMIN],
      menuIndex: 6.5,
      menuSection: "main",
    },
  ],
};

// Student Portal Routes with Menu Config
export const studentPortalRoutes: RouteConfig = {
  path: "/student-portal",
  element: (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  ),
  children: [
    {
      path: "",
      element: <Dashboard />,
      menuLabel: "Bảng điều khiển",
      menuIcon: <HomeOutlined style={{ color: "rgba(0, 0, 0, 0.5)" }} />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.STUDENT], // Only students
      menuIndex: 5,
      menuSection: "main",
    },
    {
      path: "dashboard",
      element: <Dashboard />,
      showInMenu: false,
    },
    {
      path: "roadmap",
      element: <Roadmap />,
      menuLabel: "Lộ trình học tập",
      menuIcon: <FlagOutlined style={{ color: "rgba(0, 0, 0, 0.5)" }} />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.STUDENT],
      menuIndex: 6,
      menuSection: "main",
    },
    {
      path: "credentials",
      element: <MyCredentials />,
      menuLabel: "Chứng chỉ của tôi",
      menuIcon: <IdcardOutlined style={{ color: "rgba(0, 0, 0, 0.5)" }} />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.STUDENT], // Only students
      menuIndex: 7,
      menuSection: "main",
    },
    {
      path: "credentials/:id",
      element: <CredentialDetail />,
      showInMenu: false,
    },
    {
      path: "request-credential",
      element: <RequestCredential />,
      menuLabel: "Yêu cầu chứng chỉ",
      menuIcon: <FileTextOutlined style={{ color: "rgba(0, 0, 0, 0.5)" }} />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.STUDENT],
      menuIndex: 7.5,
      menuSection: "main",
    },
    {
      path: "timetable",
      element: <WeeklyTimetable />,
      menuLabel: "Thời khóa biểu",
      menuIcon: <CalendarOutlined style={{ color: "rgba(0, 0, 0, 0.5)" }} />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.STUDENT], // Only students
      menuIndex: 8,
      menuSection: "main",
    },
    {
      path: "course-registration",
      element: <CourseRegistration />,
      menuLabel: "Đăng ký môn học",
      menuIcon: <BookOutlined style={{ color: "rgba(0, 0, 0, 0.5)" }} />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.STUDENT],
      menuIndex: 9,
      menuSection: "main",
    },
    {
      path: "enroll-list",
      element: <EnrollList />,
      showInMenu: false,
    },
    {
      path: "attendance-report",
      element: <AttendanceReport />,
      menuLabel: "Báo cáo điểm danh",
      menuIcon: <CheckCircleOutlined style={{ color: "rgba(0, 0, 0, 0.5)" }} />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.STUDENT], // Only students
      menuIndex: 10,
      menuSection: "main",
    },
    {
      path: "grade-report",
      element: <GradeReport />,
      menuLabel: "Báo cáo điểm",
      menuIcon: <RiseOutlined style={{ color: "rgba(0, 0, 0, 0.5)" }} />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.STUDENT], // Only students
      menuIndex: 11,
      menuSection: "main",
    },
    {
      path: "share",
      element: <SharePortal />,
      menuLabel: "Cổng chia sẻ",
      menuIcon: <ShareAltOutlined style={{ color: "rgba(0, 0, 0, 0.5)" }} />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.STUDENT], // Only students
      menuIndex: 12,
      menuSection: "main",
    },
    {
      path: "profile",
      element: <Profile />,
      menuLabel: "Hồ sơ",
      menuIcon: <UserOutlined style={{ color: "rgba(0, 0, 0, 0.5)" }} />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.STUDENT], // Only students
      menuIndex: 13,
      menuSection: "main",
    },
    {
      path: "activity/:id",
      element: <ActivityDetail />,
      showInMenu: false,
    },
    {
      path: "instructor/:code",
      element: <InstructorDetail />,
      showInMenu: false,
    },
    {
      path: "class-list/:courseCode",
      element: <ClassStudentList />,
      showInMenu: false,
    },
  ],
};

// Teacher Routes with Menu Config
export const teacherRoutes: RouteConfig = {
  path: "/teacher",
  element: (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  ),
  children: [
    {
      path: "/teacher",
      element: <Navigate to="/teacher/schedule" replace />,
      showInMenu: false,
    },
    {
      path: "/teacher/schedule",
      element: <TeacherSchedule />,
      menuLabel: "Lịch giảng dạy",
      menuIcon: <ScheduleOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.TEACHER],
      menuIndex: 1,
      menuSection: "main",
    },
    {
      path: "/teacher/grading",
      element: <TeacherGrading />,
      menuLabel: "Chấm điểm",
      menuIcon: <EditOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.TEACHER],
      requiredPermissions: [PERMISSIONS.MANAGE_GRADES],
      menuIndex: 4,
      menuSection: "main",
    },
    {
      path: "/teacher/profile",
      element: <TeacherProfile />,
      menuLabel: "Hồ sơ",
      menuIcon: <UserOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.TEACHER],
      menuIndex: 2,
      menuSection: "main",
    },
    {
      path: "/teacher/classes",
      element: <TeacherTeachingClasses />,
      menuLabel: "Lớp giảng dạy",
      menuIcon: <BookOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.TEACHER],
      menuIndex: 3,
      menuSection: "main",
    },
    {
      path: "/teacher/class-list/:courseCode",
      element: <TeacherClassStudentList />,
      showInMenu: false,
    },
  ],
};

// Public Portal Routes (moved to root level in App.tsx)
// Keeping this for reference but routes are now at root level
export const publicPortalRoutes: RouteConfig = {
  path: "/public-portal",
  element: <PublicPortalLayout />,
  children: [
    {
      path: "",
      element: <PublicHome />,
    },
    {
      path: "home",
      element: <PublicHome />,
    },
    {
      path: "verify",
      element: <VerificationPortal />,
    },
    {
      path: "results",
      element: <VerificationResults />,
    },
    {
      path: "certificates/verify/:credentialId",
      element: <VerificationResults />,
    },
    {
      path: "history",
      element: <VerificationHistory />,
    },
    {
      path: "help",
      element: <AboutHelp />,
    },
  ],
};
