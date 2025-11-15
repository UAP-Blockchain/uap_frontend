/**
 * Application Route Configurations
 * Centralized route definitions with menu metadata
 */

import {
  BellOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  DashboardOutlined,
  EditOutlined,
  FileTextOutlined,
  HomeOutlined,
  IdcardOutlined,
  LineChartOutlined,
  ScheduleOutlined,
  SecurityScanOutlined,
  SettingOutlined,
  ShareAltOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
  CheckCircleOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import { Outlet } from "react-router-dom";
import type { Permission, RoleCode } from "../constants/roles";
import { PERMISSIONS, ROLE_CODES } from "../constants/roles";
import ClassesManagement from "../pages/admin/classes";
import ClassDetail from "../pages/admin/classes/ClassDetail";
import SubjectsManagement from "../pages/admin/subjects";
import CredentialsManagement from "../pages/admin/credentials";
import ManagerProduct from "../pages/admin/products";
import ReportsManagement from "../pages/admin/reports";
import RolesManagement from "../pages/admin/roles";
import SecurityManagement from "../pages/admin/security";
import StudentsManagement from "../pages/admin/students";
import TeachersManagement from "../pages/admin/teachers";
import RegisterUser from "../pages/admin/registerUser";
import BulkRegister from "../pages/admin/bulkRegister";
import SemestersManagement from "../pages/admin/semesters";
import AboutHelp from "../pages/PublicPortal/AboutHelp";
import PublicHome from "../pages/PublicPortal/Home";
import VerificationHistory from "../pages/PublicPortal/VerificationHistory";
import VerificationPortal from "../pages/PublicPortal/VerificationPortal";
import VerificationResults from "../pages/PublicPortal/VerificationResults";
import ActivityDetail from "../pages/StudentPortal/ActivityDetail";
import AttendanceReport from "../pages/StudentPortal/AttendanceReport";
import ClassStudentList from "../pages/StudentPortal/ClassStudentList";
import CourseRegistration from "../pages/StudentPortal/CourseRegistration";
import CredentialDetail from "../pages/StudentPortal/CredentialDetail";
import Dashboard from "../pages/StudentPortal/Dashboard";
import GradeReport from "../pages/StudentPortal/GradeReport";
import InstructorDetail from "../pages/StudentPortal/InstructorDetail";
import MyCredentials from "../pages/StudentPortal/MyCredentials";
import Profile from "../pages/StudentPortal/Profile";
import SharePortal from "../pages/StudentPortal/SharePortal";
import WeeklyTimetable from "../pages/StudentPortal/WeeklyTimetable";
import TeacherAttendance from "../pages/teacher/attendance";
import TeacherClassStudentList from "../pages/teacher/classList";
import TeacherDashboard from "../pages/teacher/dashboard";
import TeacherGrading from "../pages/teacher/grading";
import TeacherResults from "../pages/teacher/results";
import TeacherSchedule from "../pages/teacher/schedule";
import AdminLayout from "../layout";

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
      menuLabel: "Dashboard",
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
      path: "/admin/students",
      element: <StudentsManagement />,
      menuLabel: "Quản lý Sinh viên",
      menuIcon: <UserOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.ADMIN, ROLE_CODES.MANAGER],
      requiredPermissions: [PERMISSIONS.MANAGE_STUDENTS],
      menuIndex: 1,
      menuSection: "main",
    },
    {
      path: "/admin/teachers",
      element: <TeachersManagement />,
      menuLabel: "Quản lý Giảng viên",
      menuIcon: <TeamOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.ADMIN, ROLE_CODES.MANAGER],
      requiredPermissions: [PERMISSIONS.MANAGE_TEACHERS],
      menuIndex: 2,
      menuSection: "main",
    },
    {
      path: "/admin/subjects",
      element: <SubjectsManagement />,
      menuLabel: "Quản lý Môn học",
      menuIcon: <BookOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.ADMIN, ROLE_CODES.MANAGER],
      menuIndex: 3,
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
      menuIndex: 4,
      menuSection: "main",
    },
    {
      path: "/admin/classes/:id",
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
      menuIndex: 5,
      menuSection: "main",
    },
    {
      path: "/admin/roles",
      element: <RolesManagement />,
      menuLabel: "Quản lý Vai trò",
      menuIcon: <SecurityScanOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.ADMIN], // Only admin
      menuIndex: 6,
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
      menuLabel: "Blockchain Monitor",
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
      menuIndex: 6,
      menuSection: "main",
    },
    {
      path: "/admin/users/bulk-register",
      element: <BulkRegister />,
      menuLabel: "Bulk Register",
      menuIcon: <TeamOutlined />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.ADMIN],
      menuIndex: 7,
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
      menuLabel: "Student Dashboard",
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
      path: "credentials",
      element: <MyCredentials />,
      menuLabel: "My Credentials",
      menuIcon: <IdcardOutlined style={{ color: "rgba(0, 0, 0, 0.5)" }} />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.STUDENT], // Only students
      menuIndex: 6,
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
      menuLabel: "Weekly Timetable",
      menuIcon: <CalendarOutlined style={{ color: "rgba(0, 0, 0, 0.5)" }} />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.STUDENT], // Only students
      menuIndex: 7,
      menuSection: "main",
    },
    {
      path: "course-registration",
      element: <CourseRegistration />,
      menuLabel: "Course Registration",
      menuIcon: <BookOutlined style={{ color: "rgba(0, 0, 0, 0.5)" }} />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.STUDENT],
      menuIndex: 8,
      menuSection: "main",
    },
    {
      path: "attendance-report",
      element: <AttendanceReport />,
      menuLabel: "Attendance Report",
      menuIcon: <CheckCircleOutlined style={{ color: "rgba(0, 0, 0, 0.5)" }} />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.STUDENT], // Only students
      menuIndex: 9,
      menuSection: "main",
    },
    {
      path: "grade-report",
      element: <GradeReport />,
      menuLabel: "Grade Report",
      menuIcon: <RiseOutlined style={{ color: "rgba(0, 0, 0, 0.5)" }} />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.STUDENT], // Only students
      menuIndex: 10,
      menuSection: "main",
    },
    {
      path: "share",
      element: <SharePortal />,
      menuLabel: "Share Portal",
      menuIcon: <ShareAltOutlined style={{ color: "rgba(0, 0, 0, 0.5)" }} />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.STUDENT], // Only students
      menuIndex: 11,
      menuSection: "main",
    },
    {
      path: "profile",
      element: <Profile />,
      menuLabel: "Student Profile",
      menuIcon: <UserOutlined style={{ color: "rgba(0, 0, 0, 0.5)" }} />,
      showInMenu: true,
      allowedRoles: [ROLE_CODES.STUDENT], // Only students
      menuIndex: 12,
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
      menuLabel: "Dashboard",
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
