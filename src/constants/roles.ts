/**
 * Role Constants
 * Định nghĩa các role codes được sử dụng trong hệ thống
 */

export const ROLE_CODES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
  GUEST: "GUEST",
} as const;

/**
 * Map backend role names to frontend role codes
 * Backend returns: "Admin", "Teacher", "Student", "Employer"
 */
export const BACKEND_ROLE_MAP: Record<string, typeof ROLE_CODES[keyof typeof ROLE_CODES]> = {
  Admin: ROLE_CODES.ADMIN,
  Teacher: ROLE_CODES.TEACHER,
  Student: ROLE_CODES.STUDENT,
  Employer: ROLE_CODES.GUEST, // Employer maps to GUEST for now
};

/**
 * Convert backend role name to frontend role code
 */
export const mapBackendRoleToCode = (backendRole: string): typeof ROLE_CODES[keyof typeof ROLE_CODES] => {
  return BACKEND_ROLE_MAP[backendRole] || ROLE_CODES.GUEST;
};

export type RoleCode = typeof ROLE_CODES[keyof typeof ROLE_CODES];

/**
 * Permission Constants
 * Định nghĩa các permission keys
 */
export const PERMISSIONS = {
  // Student Management
  MANAGE_STUDENTS: "manage_students",
  VIEW_STUDENTS: "view_students",
  
  // Class Management
  MANAGE_CLASSES: "manage_classes",
  VIEW_CLASSES: "view_classes",
  
  // Credential Management
  MANAGE_CREDENTIALS: "manage_credentials",
  VIEW_CREDENTIALS: "view_credentials",
  
  // Grade Management
  MANAGE_GRADES: "manage_grades",
  VIEW_GRADES: "view_grades",
  
  // Attendance Management
  MANAGE_ATTENDANCE: "manage_attendance",
  VIEW_ATTENDANCE: "view_attendance",
  
  // Reports
  VIEW_REPORTS: "view_reports",
  EXPORT_REPORTS: "export_reports",
  
  // Blockchain
  VIEW_BLOCKCHAIN: "view_blockchain",
  MANAGE_BLOCKCHAIN: "manage_blockchain",
  
  // Security
  MANAGE_SECURITY: "manage_security",
  MANAGE_ROLES: "manage_roles",
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Role Permissions Mapping
 * Định nghĩa permissions cho từng role
 */
export const ROLE_PERMISSIONS: Record<RoleCode, Permission[]> = {
  [ROLE_CODES.ADMIN]: [
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.MANAGE_CLASSES,
    PERMISSIONS.MANAGE_CREDENTIALS,
    PERMISSIONS.MANAGE_GRADES,
    PERMISSIONS.MANAGE_ATTENDANCE,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.VIEW_BLOCKCHAIN,
    PERMISSIONS.MANAGE_BLOCKCHAIN,
    PERMISSIONS.MANAGE_SECURITY,
    PERMISSIONS.MANAGE_ROLES,
  ],
  [ROLE_CODES.MANAGER]: [
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.MANAGE_CLASSES,
    PERMISSIONS.MANAGE_CREDENTIALS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.VIEW_BLOCKCHAIN,
  ],
  [ROLE_CODES.TEACHER]: [
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.MANAGE_CLASSES,
    PERMISSIONS.VIEW_CLASSES,
    PERMISSIONS.VIEW_CREDENTIALS,
    PERMISSIONS.MANAGE_GRADES,
    PERMISSIONS.MANAGE_ATTENDANCE,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_BLOCKCHAIN,
  ],
  [ROLE_CODES.STUDENT]: [
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.VIEW_CLASSES,
    PERMISSIONS.VIEW_CREDENTIALS,
    PERMISSIONS.VIEW_GRADES,
    PERMISSIONS.VIEW_ATTENDANCE,
  ],
  [ROLE_CODES.GUEST]: [],
};

/**
 * Kiểm tra xem một role có permission cụ thể hay không
 */
export const hasPermission = (roleCode: RoleCode, permission: Permission): boolean => {
  const rolePermissions = ROLE_PERMISSIONS[roleCode];
  return rolePermissions ? rolePermissions.includes(permission) : false;
};

/**
 * Kiểm tra xem một role có bất kỳ permission nào trong danh sách hay không
 */
export const hasAnyPermission = (roleCode: RoleCode, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(roleCode, permission));
};

/**
 * Kiểm tra xem một role có tất cả permissions trong danh sách hay không
 */
export const hasAllPermissions = (roleCode: RoleCode, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(roleCode, permission));
};

