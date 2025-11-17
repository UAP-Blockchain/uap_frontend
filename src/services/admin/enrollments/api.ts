import api from "../../../config/axios";

export interface EnrollmentRequest {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  studentEmail: string;
  classId: string;
  classCode: string;
  subjectName: string;
  subjectCode: string;
  registeredAt: string;
  isApproved: boolean;
  status: string;
}

interface EnrollmentsApiResponse {
  items?: EnrollmentRequest[];
  data?: EnrollmentRequest[];
}

const normalizeItems = (payload: EnrollmentsApiResponse): EnrollmentRequest[] => {
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
};

export const fetchEnrollmentsByClassApi = async (
  classId: string
): Promise<EnrollmentRequest[]> => {
  const response = await api.get<EnrollmentsApiResponse>("/Enrollments", {
    params: {
      ClassId: classId,
      Status: "Pending",
    },
  });
  return normalizeItems(response.data);
};

export const approveEnrollmentApi = async (id: string): Promise<void> => {
  await api.patch(`/Enrollments/${id}/approve`);
};

export const rejectEnrollmentApi = async (
  id: string,
  reason: string
): Promise<void> => {
  await api.patch(`/Enrollments/${id}/reject`, { reason });
};


