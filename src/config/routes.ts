/**
 * Application Routes Configuration
 * Centralized route definitions for the entire application
 */

export const ROUTES = {
  // Public Routes
  HOME: "/",
  LOGIN: "/login",

  // Admin Routes
  ADMIN: {
    BASE: "/admin",
    DASHBOARD: "/admin/dashboard",
    STUDENTS: "/admin/students",
    TEACHERS: "/admin/teachers",
    CLASSES: "/admin/classes",
    SEMESTERS: "/admin/semesters",
    ROLES: "/admin/roles",
    CREDENTIALS: "/admin/credentials",
    REPORTS: "/admin/reports",
    SECURITY: "/admin/security",
    BLOCKCHAIN: "/admin/blockchain",
    PRODUCTS: "/admin/quan-ly-san-pham",
  },

  // Student Portal Routes
  STUDENT_PORTAL: {
    BASE: "/student-portal",
    DASHBOARD: "/student-portal",
    ROADMAP: "/student-portal/roadmap",
    CREDENTIALS: "/student-portal/credentials",
    CREDENTIAL_DETAIL: "/student-portal/credentials/:id",
    TIMETABLE: "/student-portal/timetable",
    COURSE_REGISTRATION: "/student-portal/course-registration",
    ATTENDANCE_REPORT: "/student-portal/attendance-report",
    GRADE_REPORT: "/student-portal/grade-report",
    SHARE: "/student-portal/share",
    PROFILE: "/student-portal/profile",
    ACTIVITY_DETAIL: "/student-portal/activity/:id",
    INSTRUCTOR_DETAIL: "/student-portal/instructor/:code",
    CLASS_LIST: "/student-portal/class-list/:courseCode",
  },

  // Teacher Routes
  TEACHER: {
    BASE: "/teacher",
    DASHBOARD: "/teacher/dashboard",
    SCHEDULE: "/teacher/schedule",
    ATTENDANCE: "/teacher/attendance",
    GRADING: "/teacher/grading",
    RESULTS: "/teacher/results",
    CLASS_LIST: "/teacher/class-list/:courseCode",
  },

  // Public Portal Routes
  PUBLIC_PORTAL: {
    BASE: "/public-portal",
    HOME: "/public-portal/home",
    VERIFY: "/public-portal/verify",
    RESULTS: "/public-portal/results",
    HISTORY: "/public-portal/history",
    HELP: "/public-portal/help",
  },
} as const;

export default ROUTES;

