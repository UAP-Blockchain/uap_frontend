import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";

import type { RefreshTokenResponse } from "../types/Auth";

import { logout } from "../redux/features/authSlice";
import { store } from "../redux/store";
import { navigateTo } from "../utils/navigation";


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://uap-api-594658851010.asia-southeast1.run.app/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increased to 60 seconds for bulk operations
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add token to headers
api.interceptors.request.use(
  function (config: InternalAxiosRequestConfig) {
    // Get token from localStorage or cookies
    const token = localStorage.getItem("token") || getCookie("token");
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  function (response) {
    return response;
  },
  async function (error: AxiosError) {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken") || getCookie("refreshToken");
        
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call refresh token API
        const response = await api.post<RefreshTokenResponse>(
           "/Auth/refresh-token",
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Update tokens
        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        setCookie("token", accessToken);
        setCookie("refreshToken", newRefreshToken);

        // Update original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        store.dispatch(logout());
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        clearAllCookies();
        
        // Redirect to login using React Router navigation
        if (window.location.pathname !== "/login") {
          navigateTo("/login", { replace: true });
        }
        
        return Promise.reject(refreshError);
      }
    }

    // Global error handler - skip if request has skipGlobalErrorHandler flag
    const skipGlobalError = (originalRequest as any)?.skipGlobalErrorHandler;
    
    if (!skipGlobalError) {
    if (error.response) {
      // Error from backend (4xx, 5xx)
      const message = 
        (error.response.data as unknown as { message?: string; error?: string })?.message || 
        (error.response.data as unknown as { error?: string })?.error ||
        error.message ||
        "An error occurred while calling the API";
      
      // Import toast and display
      const { toast } = await import("react-toastify");
      toast.error(message);
    } else if (error.request) {
        // Network error (no response) — suppress noisy global toast
        // Still reject to let caller handle if needed
        // Optional: log silently
        // console.warn("Network error, suppressed toast:", error);
      }
    }

    return Promise.reject(error);
  }
);

// Helper functions for cookies
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function clearAllCookies() {
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
}

export default api;
