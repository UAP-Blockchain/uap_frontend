import api from "../../../config/axios";
import type {
  AddSubjectToCurriculumRequest,
  ApiResponseEnvelope,
  CurriculumDetailDto,
  CurriculumListItem,
  CurriculumSubjectDto,
  CreateCurriculumRequest,
  UpdateCurriculumRequest,
} from "../../../types/Curriculum";

const isApiEnvelope = <T>(payload: unknown): payload is ApiResponseEnvelope<T> => {
  return (
    typeof payload === "object" &&
    payload !== null &&
    Object.prototype.hasOwnProperty.call(payload, "data")
  );
};

const unwrapData = <T>(payload: ApiResponseEnvelope<T> | T | undefined, fallback?: T): T => {
  if (payload && isApiEnvelope<T>(payload) && payload.data !== undefined) {
    return payload.data;
  }

  if (payload !== undefined) {
    return payload as T;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error("API response does not contain data");
};

export const fetchCurriculumsApi = async (): Promise<CurriculumListItem[]> => {
  const response = await api.get<ApiResponseEnvelope<CurriculumListItem[]>>(
    "/Curriculum",
    { skipGlobalErrorHandler: true } as any
  );
  return unwrapData(response.data, []);
};

export const getCurriculumByIdApi = async (
  id: number
): Promise<CurriculumDetailDto> => {
  const response = await api.get<ApiResponseEnvelope<CurriculumDetailDto>>(
    `/Curriculum/${id}`,
    { skipGlobalErrorHandler: true } as any
  );
  return unwrapData(response.data);
};

export const createCurriculumApi = async (
  payload: CreateCurriculumRequest
): Promise<CurriculumListItem> => {
  const response = await api.post<ApiResponseEnvelope<CurriculumListItem>>(
    "/Curriculum",
    payload,
    { skipGlobalErrorHandler: true } as any
  );
  return unwrapData(response.data);
};

export const updateCurriculumApi = async (
  id: number,
  payload: UpdateCurriculumRequest
): Promise<CurriculumListItem> => {
  const response = await api.put<ApiResponseEnvelope<CurriculumListItem>>(
    `/Curriculum/${id}`,
    payload,
    { skipGlobalErrorHandler: true } as any
  );
  return unwrapData(response.data);
};

export const deleteCurriculumApi = async (id: number): Promise<void> => {
  await api.delete(`/Curriculum/${id}`, { skipGlobalErrorHandler: true } as any);
};

export const addSubjectToCurriculumApi = async (
  curriculumId: number,
  payload: AddSubjectToCurriculumRequest
): Promise<CurriculumSubjectDto> => {
  const response = await api.post<ApiResponseEnvelope<CurriculumSubjectDto>>(
    `/Curriculum/${curriculumId}/subjects`,
    payload,
    { skipGlobalErrorHandler: true } as any
  );
  return unwrapData(response.data);
};

export const removeSubjectFromCurriculumApi = async (
  curriculumId: number,
  subjectId: string
): Promise<void> => {
  await api.delete(`/Curriculum/${curriculumId}/subjects/${subjectId}`, {
    skipGlobalErrorHandler: true,
  } as any);
};
