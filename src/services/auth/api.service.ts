import api from "../../config/axios";
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  SendOtpRequest,
  VerifyOtpRequest,
  ResetPasswordWithOtpRequest,
  OtpResponse,
  LogoutResponse,
} from "../../Types/Auth";

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
   * Verify OTP code
   */
  static async verifyOtp(params: VerifyOtpRequest): Promise<OtpResponse> {
    const response = await api.post<OtpResponse>("/Auth/verify-otp", params);
    return response.data;
  }

  /**
   * Change password (requires authentication)
   */
  static async changePassword(
    params: ChangePasswordRequest
  ): Promise<ChangePasswordResponse> {
    const response = await api.put<ChangePasswordResponse>(
      "/Auth/change-password",
      params
    );
    return response.data;
  }

  /**
   * Reset password using OTP
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
}

export default AuthServices;
