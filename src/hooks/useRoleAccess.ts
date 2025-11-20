/**
 * Custom Hook for Role-Based Access Control
 * Provides utilities to check user roles and permissions
 */

import { useSelector } from "react-redux";
import {
    PERMISSIONS,
    type Permission,
    ROLE_CODES,
    ROLE_PERMISSIONS,
    type RoleCode,
    hasAllPermissions as checkAllPermissions,
    hasAnyPermission as checkAnyPermission,
    hasPermission as checkPermission,
} from "../constants/roles";
import type { RootState } from "../redux/store";

/**
 * Hook to get current user's role and permission checking utilities
 */
export const useRoleAccess = () => {
  const { userProfile } = useSelector((state: RootState) => state.auth);
  const currentRole = (userProfile?.roleCode || ROLE_CODES.GUEST) as RoleCode;

  /**
   * Check if current user has a specific role
   */
  const hasRole = (role: RoleCode): boolean => {
    return currentRole === role;
  };

  /**
   * Check if current user has any of the specified roles
   */
  const hasAnyRole = (roles: RoleCode[]): boolean => {
    return roles.includes(currentRole);
  };

  /**
   * Check if current user has a specific permission
   */
  const hasPermission = (permission: Permission): boolean => {
    return checkPermission(currentRole, permission);
  };

  /**
   * Check if current user has any of the specified permissions
   */
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return checkAnyPermission(currentRole, permissions);
  };

  /**
   * Check if current user has all of the specified permissions
   */
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return checkAllPermissions(currentRole, permissions);
  };

  /**
   * Check if current user is admin
   */
  const isAdmin = (): boolean => {
    return currentRole === ROLE_CODES.ADMIN;
  };

  /**
   * Check if current user is manager
   */
  const isManager = (): boolean => {
    return currentRole === ROLE_CODES.MANAGER;
  };

  /**
   * Check if current user is teacher
   */
  const isTeacher = (): boolean => {
    return currentRole === ROLE_CODES.TEACHER;
  };

  /**
   * Check if current user is student
   */
  const isStudent = (): boolean => {
    return currentRole === ROLE_CODES.STUDENT;
  };

  /**
   * Get all permissions for current user's role
   */
  const getUserPermissions = (): Permission[] => {
    return ROLE_PERMISSIONS[currentRole] || [];
  };

  /**
   * Check if user can manage students
   */
  const canManageStudents = (): boolean => {
    return hasPermission(PERMISSIONS.MANAGE_STUDENTS);
  };

  /**
   * Check if user can manage classes
   */
  const canManageClasses = (): boolean => {
    return hasPermission(PERMISSIONS.MANAGE_CLASSES);
  };

  /**
   * Check if user can manage credentials
   */
  const canManageCredentials = (): boolean => {
    return hasPermission(PERMISSIONS.MANAGE_CREDENTIALS);
  };

  /**
   * Check if user can view reports
   */
  const canViewReports = (): boolean => {
    return hasPermission(PERMISSIONS.VIEW_REPORTS);
  };

  return {
    // User info
    currentRole,
    userProfile,

    // Role checking
    hasRole,
    hasAnyRole,
    isAdmin,
    isManager,
    isTeacher,
    isStudent,

    // Permission checking
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,

    // Common permission checks
    canManageStudents,
    canManageClasses,
    canManageCredentials,
    canViewReports,

    // Constants for convenience
    ROLE_CODES,
    PERMISSIONS,
  };
};

/**
 * Hook for conditional rendering based on role
 * Usage: const { canRender } = useRoleGuard(['ADMIN', 'MANAGER']);
 */
export const useRoleGuard = (allowedRoles: RoleCode[]) => {
  const { hasAnyRole } = useRoleAccess();

  const canRender = hasAnyRole(allowedRoles);

  return {
    canRender,
    shouldHide: !canRender,
  };
};

/**
 * Hook for conditional rendering based on permissions
 * Usage: const { canRender } = usePermissionGuard(['manage_students']);
 */
export const usePermissionGuard = (requiredPermissions: Permission[]) => {
  const { hasAllPermissions } = useRoleAccess();

  const canRender = hasAllPermissions(requiredPermissions);

  return {
    canRender,
    shouldHide: !canRender,
  };
};

export default useRoleAccess;

