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
  purpose: "Registration" | "PasswordReset";
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
  purpose: "Registration" | "PasswordReset";
}

export interface ResetPasswordWithOtpRequest {
  email: string;
  otpCode: string;
  newPassword: string;
  confirmPassword: string;
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

