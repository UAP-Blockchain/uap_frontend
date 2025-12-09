import api from "../../config/axios";
import type {
  BulkRegisterRequest,
  BulkRegisterResponse,
  ChangePasswordResponse,
  ChangePasswordWithOtpRequest,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  OtpResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterUserRequest,
  RegisterUserResponse,
  ResetPasswordWithOtpRequest,
  SendOtpRequest
} from "../../types/Auth";

class AuthServices {
  /**
   * Login with email and password
   */
  static async login(params: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/Auth/login", params);
    return response.data;
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(
    refreshToken: string
  ): Promise<RefreshTokenResponse> {
    const response = await api.post<RefreshTokenResponse>(
      "/Auth/refresh-token",
      { refreshToken } as RefreshTokenRequest
    );
    return response.data;
  }

  /**
   * Logout - invalidate refresh token
   */
  static async logout(): Promise<LogoutResponse> {
    const response = await api.post<LogoutResponse>("/Auth/logout");
    return response.data;
  }

  /**
   * Send OTP to email
   */
  static async sendOtp(params: SendOtpRequest): Promise<OtpResponse> {
    const response = await api.post<OtpResponse>("/Auth/send-otp", params);
    return response.data;
  }

  /**
   * Change password with OTP (requires authentication)
   */
  static async changePasswordWithOtp(
    params: ChangePasswordWithOtpRequest
  ): Promise<ChangePasswordResponse> {
    const response = await api.put<ChangePasswordResponse>(
      "/Auth/change-password-with-otp",
      params
    );
    return response.data;
  }

  /**
   * Reset password using OTP (for forgot password - no login required)
   */
  static async resetPasswordWithOtp(
    params: ResetPasswordWithOtpRequest
  ): Promise<OtpResponse> {
    const response = await api.post<OtpResponse>(
      "/Auth/reset-password-with-otp",
      params
    );
    return response.data;
  }

  /**
   * Register a new user (Admin only)
   */
  static async registerUser(
    params: RegisterUserRequest
  ): Promise<RegisterUserResponse> {
    const response = await api.post<RegisterUserResponse>(
      "/Auth/register",
      params
    );
    return response.data;
  }

  /**
   * Bulk register multiple users (Admin only)
   */
  static async bulkRegister(
    params: BulkRegisterRequest
  ): Promise<BulkRegisterResponse> {
    const response = await api.post<BulkRegisterResponse>(
      "/Auth/register/bulk",
      params,
      {
        skipGlobalErrorHandler: true,
      } as any
    );
    return response.data;
  }
}

export default AuthServices;
