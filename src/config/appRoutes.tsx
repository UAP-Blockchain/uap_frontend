/**
 * Application Route Configurations
 * Centralized route definitions with menu metadata
 * Using React.lazy() for code splitting and performance optimization
 */

import {
  BellOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CheckSquareOutlined,
  DashboardOutlined,
  EditOutlined,
  FileTextOutlined,
  FlagOutlined,
  HomeOutlined,
  IdcardOutlined,
  LineChartOutlined,
  RiseOutlined,
  ScheduleOutlined,
  SettingOutlined,
  ShareAltOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { lazy } from "react";
import { Outlet } from "react-router-dom";
import type { Permission, RoleCode } from "../constants/roles";
import { PERMISSIONS, ROLE_CODES } from "../constants/roles";
import AdminLayout from "../layout";

// Lazy load all page components for code splitting
const ClassesManagement = lazy(() => import("../pages/admin/classes"));
const ClassDetail = lazy(() => import("../pages/admin/classes/ClassDetail"));
const SubjectsManagement = lazy(() => import("../pages/admin/subjects"));
const CredentialsManagement = lazy(() => import("../pages/admin/credentials"));
const ManagerProduct = lazy(() => import("../pages/admin/products"));
const ReportsManagement = lazy(() => import("../pages/admin/reports"));
const SecurityManagement = lazy(() => import("../pages/admin/security"));
const TeachersManagement = lazy(() => import("../pages/admin/teachers"));
const RegisterUser = lazy(() => import("../pages/admin/registerUser"));
const BulkRegister = lazy(() => import("../pages/admin/bulkRegister"));
const SemestersManagement = lazy(() => import("../pages/admin/semesters"));
const AboutHelp = lazy(() => import("../pages/PublicPortal/AboutHelp"));
const PublicHome = lazy(() => import("../pages/PublicPortal/Home"));
const VerificationHistory = lazy(() => import("../pages/PublicPortal/VerificationHistory"));
const VerificationPortal = lazy(() => import("../pages/PublicPortal/VerificationPortal"));
const VerificationResults = lazy(() => import("../pages/PublicPortal/VerificationResults"));
const ActivityDetail = lazy(() => import("../pages/StudentPortal/ActivityDetail"));
const AttendanceReport = lazy(() => import("../pages/StudentPortal/AttendanceReport"));
const ClassStudentList = lazy(() => import("../pages/StudentPortal/ClassStudentList"));
const CourseRegistration = lazy(() => import("../pages/StudentPortal/CourseRegistration"));
const CredentialDetail = lazy(() => import("../pages/StudentPortal/CredentialDetail"));
const Dashboard = lazy(() => import("../pages/StudentPortal/Dashboard"));
const GradeReport = lazy(() => import("../pages/StudentPortal/GradeReport"));
const InstructorDetail = lazy(() => import("../pages/StudentPortal/InstructorDetail"));
const MyCredentials = lazy(() => import("../pages/StudentPortal/MyCredentials"));
const Profile = lazy(() => import("../pages/StudentPortal/Profile"));
const Roadmap = lazy(() => import("../pages/StudentPortal/Roadmap"));
const SharePortal = lazy(() => import("../pages/StudentPortal/SharePortal"));
const WeeklyTimetable = lazy(() => import("../pages/StudentPortal/WeeklyTimetable"));
const TeacherAttendance = lazy(() => import("../pages/teacher/attendance"));
const TeacherClassStudentList = lazy(() => import("../pages/teacher/classList"));
const TeacherDashboard = lazy(() => import("../pages/teacher/dashboard"));
const TeacherGrading = lazy(() => import("../pages/teacher/grading"));
const TeacherResults = lazy(() => import("../pages/teacher/results"));
const TeacherSchedule = lazy(() => import("../pages/teacher/schedule"));

// Extended Route Config with Menu Metadata
export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  children?: RouteConfig[];
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
      menuLabel: "Bảng điều khiển",
      menuIcon: <DashboardOutlined />,
      showInMenu: true,
      menuIndex: 0,
      menuSection: "main",
      // Dashboard for admin roles only (not student)
      allowedRoles: [ROLE_CODES.ADMIN, ROLE_CODES.MANAGER, ROLE_CODES.TEACHER],
    },
    {
      path: "/admin/dashboard",
      element: <Dashboard />,
      showInMenu: false,
    },
    {
      path: "/admin/teachers",
      element: <TeachersManagement />,
      menuLabel: "Quản lý Giảng viên",
      menuIcon: <TeamOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.ADMIN, ROLE_CODES.MANAGER],
      requiredPermissions: [PERMISSIONS.MANAGE_TEACHERS],
      menuIndex: 1,
      menuSection: "main",
    },
    {
      path: "/admin/subjects",
      element: <SubjectsManagement />,
      menuLabel: "Quản lý Môn học",
      menuIcon: <BookOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.ADMIN, ROLE_CODES.MANAGER],
      menuIndex: 2,
      menuSection: "main",
    },
    {
      path: "/admin/classes",
      element: <ClassesManagement />,
      menuLabel: "Quản lý Lớp học",
      menuIcon: <BookOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.ADMIN, ROLE_CODES.MANAGER, ROLE_CODES.TEACHER],
      requiredPermissions: [PERMISSIONS.MANAGE_CLASSES],
      menuIndex: 3,
      menuSection: "main",
    },
    {
      path: "/admin/classes/:classCode",
      element: <ClassDetail />,
      showInMenu: false,
      allowedRoles: [ROLE_CODES.ADMIN, ROLE_CODES.MANAGER, ROLE_CODES.TEACHER],
    },
    {
      path: "/admin/semesters",
      element: <SemestersManagement />,
      menuLabel: "Quản lý Học kì",
      menuIcon: <CalendarOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.ADMIN, ROLE_CODES.MANAGER],
      menuIndex: 4,
      menuSection: "main",
    },
    {
      path: "/admin/credentials",
      element: <CredentialsManagement />,
      menuLabel: "Quản lý Chứng chỉ",
      menuIcon: <TrophyOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.ADMIN, ROLE_CODES.MANAGER],
      requiredPermissions: [PERMISSIONS.MANAGE_CREDENTIALS],
      menuIndex: 0,
      menuSection: "tools",
    },
    {
      path: "/admin/blockchain",
      element: <ReportsManagement />,
      menuLabel: "Giám sát Blockchain",
      menuIcon: <BellOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.ADMIN, ROLE_CODES.MANAGER, ROLE_CODES.TEACHER],
      menuIndex: 1,
      menuSection: "tools",
    },
    {
      path: "/admin/reports",
      element: <ReportsManagement />,
      menuLabel: "Báo cáo & Thống kê",
      menuIcon: <FileTextOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.ADMIN, ROLE_CODES.MANAGER, ROLE_CODES.TEACHER],
      requiredPermissions: [PERMISSIONS.VIEW_REPORTS],
      menuIndex: 2,
      menuSection: "tools",
    },
    {
      path: "/admin/security",
      element: <SecurityManagement />,
      menuLabel: "Bảo mật & Xác thực",
      menuIcon: <SettingOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.ADMIN], // Only admin
      menuIndex: 3,
      menuSection: "tools",
    },
    {
      path: "/admin/quan-ly-san-pham",
      element: <ManagerProduct />,
      showInMenu: false,
    },
    {
      path: "/admin/users/register",
      element: <RegisterUser />,
      menuLabel: "Quản lý Người dùng",
      menuIcon: <UserOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.ADMIN],
      menuIndex: 5,
      menuSection: "main",
    },
    {
      path: "/admin/users/bulk-register",
      element: <BulkRegister />,
      menuLabel: "Đăng ký hàng loạt",
      menuIcon: <TeamOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.ADMIN],
      menuIndex: 6,
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
      element: <TeacherDashboard />,
      menuLabel: "Bảng điều khiển",
      menuIcon: <DashboardOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.TEACHER],
      menuIndex: 0,
      menuSection: "main",
    },
    {
      path: "/teacher/dashboard",
      element: <TeacherDashboard />,
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
      path: "/teacher/class-list/:courseCode",
      element: <TeacherClassStudentList />,
      showInMenu: false,
    },
    {
      path: "/teacher/attendance",
      element: <TeacherAttendance />,
      menuLabel: "Điểm danh",
      menuIcon: <CheckSquareOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.TEACHER],
      requiredPermissions: [PERMISSIONS.MANAGE_ATTENDANCE],
      menuIndex: 2,
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
      menuIndex: 3,
      menuSection: "main",
    },
    {
      path: "/teacher/results",
      element: <TeacherResults />,
      menuLabel: "Kết quả học tập",
      menuIcon: <LineChartOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.TEACHER],
      menuIndex: 4,
      menuSection: "main",
    },
  ],
};

// Public Portal Routes
export const publicPortalRoutes: RouteConfig = {
  path: "/public-portal",
  element: (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  ),
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
      path: "history",
      element: <VerificationHistory />,
    },
    {
      path: "help",
      element: <AboutHelp />,
    },
  ],
};
