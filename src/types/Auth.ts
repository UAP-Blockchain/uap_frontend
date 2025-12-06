/**
 * Auth Types
 * Type definitions for authentication API requests and responses
 * Based on backend DTOs in Fap.Domain.DTOs.Auth
 */

// ==================== Request Types ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SendOtpRequest {
  email: string;
  purpose?: string; // Optional, backend defaults to "General" if not provided
}

export interface ResetPasswordWithOtpRequest {
  email: string;
  otpCode: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordWithOtpRequest {
  otpCode: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RegisterUserRequest {
  fullName: string;
  email: string;
  password: string;
  roleName: "Student" | "Teacher";
  walletAddress?: string;
  // Student fields (optional)
  studentCode?: string;
  enrollmentDate?: string; // ISO date string
  curriculumId?: number;
  // Teacher fields (optional)
  teacherCode?: string;
  hireDate?: string; // ISO date string
  specialization?: string;
  phoneNumber?: string;
}

export interface BulkRegisterRequest {
  users: RegisterUserRequest[];
}

// ==================== Response Types ====================

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  role: string; // "Admin" | "Teacher" | "Student" | "Employer"
  fullName: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
  fullName: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message?: string;
}

export interface OtpResponse {
  message: string;
}

export interface LogoutResponse {
  message: string;
}

export interface RegisterUserResponse {
  success: boolean;
  message: string;
  userId?: string;
  email: string;
  roleName: string;
  errors?: string[];
  fullName?: string;
  phoneNumber?: string;
  studentCode?: string;
  teacherCode?: string;
  enrollmentDate?: string;
  hireDate?: string;
  specialization?: string;
  curriculumId?: number;
  // Blockchain fields (from backend UserResponse.Blockchain)
  walletAddress?: string | null;
  blockchainTxHash?: string | null;
  blockNumber?: number | null;
  blockchainRegisteredAt?: string | null;
  isOnBlockchain?: boolean;
}

export interface BulkRegisterResponse {
  success: boolean;
  message: string;
  statistics: {
    total: number;
    success: number;
    failed: number;
  };
  results: RegisterUserResponse[];
  // Legacy fields (deprecated, use statistics instead)
  totalRequested?: number;
  successCount?: number;
  failureCount?: number;
}

// ==================== User Profile Type ====================

export interface UserProfile {
  email: string;
  fullName: string;
  role: string; // Backend role name: "Admin", "Teacher", "Student"
  roleCode: string; // Frontend role code: "ADMIN", "TEACHER", "STUDENT"
}

// ==================== Auth State Type ====================

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  userProfile: UserProfile | null;
}

