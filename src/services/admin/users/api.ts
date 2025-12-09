import api from "../../../config/axios";
import type { SpecializationDto } from "../../../types/Specialization";

export interface GetUsersRequest {
  roleName?: string;
  searchTerm?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface UserDto {
  id: string;
  fullName: string;
  email: string;
  roleName: string;
  studentCode?: string;
  enrollmentDate?: string;
  teacherCode?: string;
  hireDate?: string;
  specialization?: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt?: string;
  studentId?: string;
  teacherId?: string;
  student?: { id: string; studentCode?: string };
  teacher?: { id: string; teacherCode?: string };
  profileImageUrl?: string;
  specializations?: SpecializationDto[];
}

export interface PagedUsersResponse {
  items?: UserDto[];
  data?: UserDto[];
  totalCount: number;
  page?: number;
  pageNumber?: number;
  pageSize: number;
  totalPages?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

export interface UpdateUserRequest {
  fullName: string;
  email: string;
  roleName: string;
  studentCode?: string;
  enrollmentDate?: string;
  teacherCode?: string;
  hireDate?: string;
  specialization?: string;
  phoneNumber?: string;
}

export interface UpdateUserOnChainRequest {
  transactionHash: string;
  blockNumber: number;
  registeredAtUtc?: string;
}

const normalizeItems = <T>(payload: {
  data?: T[];
  items?: T[];
}): T[] => {
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  if (Array.isArray(payload?.items)) {
    return payload.items;
  }
  return [];
};

export const fetchUsersApi = async (
  params?: GetUsersRequest
): Promise<PagedUsersResponse> => {
  const response = await api.get<PagedUsersResponse>("/User", {
    params: {
      RoleName: params?.roleName,
      SearchTerm: params?.searchTerm,
      IsActive: params?.isActive,
      Page: params?.page,
      PageSize: params?.pageSize,
      SortBy: params?.sortBy,
      SortOrder: params?.sortOrder,
    },
    skipGlobalErrorHandler: true,
  });
  const apiData = response.data;
  // Normalize response to match our interface
  return {
    ...apiData,
    data: normalizeItems<UserDto>(apiData),
    pageNumber: apiData.page || apiData.pageNumber || 1,
    totalPages: apiData.totalPages || Math.ceil((apiData.totalCount || 0) / (apiData.pageSize || 10)),
  };
};

export const getUserByIdApi = async (id: string): Promise<UserDto> => {
  const response = await api.get<UserDto>(`/User/${id}`, {
    skipGlobalErrorHandler: true,
  } as any);
  return response.data;
};

export const updateUserApi = async (
  id: string,
  payload: UpdateUserRequest
): Promise<UserDto> => {
  const response = await api.put<UserDto>(`/User/${id}`, payload, {
    skipGlobalErrorHandler: true,
  } as any);
  return response.data;
};

export const activateUserApi = async (id: string): Promise<void> => {
  await api.patch(`/User/${id}/activate`, undefined, {
    skipGlobalErrorHandler: true,
  } as any);
};

export const deactivateUserApi = async (id: string): Promise<void> => {
  await api.patch(`/User/${id}/deactivate`, undefined, {
    skipGlobalErrorHandler: true,
  } as any);
};

export const uploadUserProfilePictureApi = async (
  id: string,
  file: File
): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post<{ url: string }>(
    `/User/${id}/profile-picture`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      skipGlobalErrorHandler: true,
    }
  );
  return response.data;
};

export const updateUserOnChainApi = async (
  id: string,
  payload: UpdateUserOnChainRequest
): Promise<void> => {
  await api.post(`/User/${id}/on-chain`, payload, {
    skipGlobalErrorHandler: true,
  } as any);
};

