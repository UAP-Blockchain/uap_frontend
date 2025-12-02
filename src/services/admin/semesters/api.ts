import api from "../../../config/axios";
import type {
  CreateSemesterRequest,
  GetSemestersRequest,
  PagedSemestersResponse,
  SemesterDto,
  UpdateSemesterRequest,
} from "../../../types/Semester";

const SEMESTER_ENDPOINT = "/Semesters";

export const fetchSemestersApi = async (
  params?: GetSemestersRequest
): Promise<PagedSemestersResponse> => {
  const response = await api.get<PagedSemestersResponse>(SEMESTER_ENDPOINT, {
    params,
  });
  return response.data;
};

export const getSemesterByIdApi = async (
  id: string
): Promise<SemesterDto> => {
  const response = await api.get<SemesterDto>(`${SEMESTER_ENDPOINT}/${id}`);
  return response.data;
};

export const createSemesterApi = async (
  payload: CreateSemesterRequest
): Promise<SemesterDto> => {
  const response = await api.post<SemesterDto>(SEMESTER_ENDPOINT, payload);
  return response.data;
};

export const updateSemesterApi = async (
  id: string,
  payload: UpdateSemesterRequest
): Promise<SemesterDto> => {
  const response = await api.put<SemesterDto>(
    `${SEMESTER_ENDPOINT}/${id}`,
    payload
  );
  return response.data;
};

export const activeSemesterApi = async (id: string): Promise<void> => {
  await api.patch(
    `${SEMESTER_ENDPOINT}/${id}/active`,
    { isActive: true },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const closeSemesterApi = async (id: string): Promise<void> => {
  await api.patch(
    `${SEMESTER_ENDPOINT}/${id}/close`,
    { isClosed: true },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const deleteSemesterApi = async (id: string): Promise<void> => {
  await api.delete(`${SEMESTER_ENDPOINT}/${id}`);
};

// Re-export SemesterDto type for admin modules that need it
export type { SemesterDto } from "../../../types/Semester";

