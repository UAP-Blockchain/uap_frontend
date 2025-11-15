import api from "../../../config/axios";

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
}

export interface PagedUsersResponse {
  data: UserDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
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
  });
  return response.data;
};

export const getUserByIdApi = async (id: string): Promise<UserDto> => {
  const response = await api.get<UserDto>(`/User/${id}`);
  return response.data;
};

export const updateUserApi = async (
  id: string,
  payload: UpdateUserRequest
): Promise<UserDto> => {
  const response = await api.put<UserDto>(`/User/${id}`, payload);
  return response.data;
};

export const activateUserApi = async (id: string): Promise<void> => {
  await api.patch(`/User/${id}/activate`);
};

export const deactivateUserApi = async (id: string): Promise<void> => {
  await api.patch(`/User/${id}/deactivate`);
};

