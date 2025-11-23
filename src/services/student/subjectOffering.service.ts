import api from "../../config/axios";
import type { SubjectOffering } from "../../types/SubjectOffering";

export const getSubjectOfferingsBySubject = async (
  subjectId: string
): Promise<SubjectOffering[]> => {
  try {
    const response = await api.get<SubjectOffering[]>(
      `/SubjectOfferings/subject/${subjectId}`
    );
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

export const getSubjectOfferingsBySemester = async (
  semesterId: string
): Promise<SubjectOffering[]> => {
  try {
    const response = await api.get<SubjectOffering[]>(
      `/SubjectOfferings/semester/${semesterId}`
    );
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

export const getSubjectOfferingById = async (
  id: string
): Promise<SubjectOffering | null> => {
  try {
    const response = await api.get<SubjectOffering>(`/SubjectOfferings/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

