import api from "../../../config/axios";
import type {
  CreateSpecializationRequest,
  GetSpecializationsRequest,
  PagedSpecializationsResponse,
  SpecializationDto,
  UpdateSpecializationRequest,
} from "../../../types/Specialization";

const normalizeItems = <T>(
  payload: { data?: T[]; items?: T[] } | T[]
): T[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

export const fetchSpecializationsApi = async (
  params?: GetSpecializationsRequest
): Promise<PagedSpecializationsResponse> => {
  const response = await api.get<PagedSpecializationsResponse>(
    "/specializations",
    {
      params: {
        pageNumber: params?.pageNumber,
        pageSize: params?.pageSize,
        searchTerm: params?.searchTerm,
        isActive: params?.isActive,
      },
    }
  );
  const apiData = response.data || {};
  const items = normalizeItems<SpecializationDto>(apiData);
  return {
    data: items,
    totalCount: apiData.totalCount ?? items.length,
    pageNumber: apiData.page ?? apiData.pageNumber ?? 1,
    pageSize: apiData.pageSize ?? params?.pageSize ?? 10,
    totalPages:
      apiData.totalPages ??
      Math.ceil(
        (apiData.totalCount ?? items.length) /
          (apiData.pageSize ?? params?.pageSize ?? 10)
      ),
  };
};

export const getSpecializationByIdApi = async (
  id: string
): Promise<SpecializationDto> => {
  const response = await api.get<SpecializationDto>(`/specializations/${id}`);
  return response.data;
};

export const createSpecializationApi = async (
  payload: CreateSpecializationRequest
): Promise<SpecializationDto> => {
  const response = await api.post<SpecializationDto>(
    "/specializations",
    payload
  );
  return response.data;
};

export const updateSpecializationApi = async (
  id: string,
  payload: UpdateSpecializationRequest
): Promise<SpecializationDto> => {
  const response = await api.put<SpecializationDto>(
    `/specializations/${id}`,
    payload
  );
  return response.data;
};

export const deleteSpecializationApi = async (id: string): Promise<void> => {
  await api.delete(`/specializations/${id}`);
};

