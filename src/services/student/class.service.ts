import api from "../../config/axios";
import type { ClassSummary } from "../../types/Class";
import type { SlotDto } from "../../types/Slot";

export const getClassesBySubjectAndSemester = async (
  subjectId: string,
  semesterId: string
): Promise<ClassSummary[]> => {
  try {
    const response = await api.get<{
      data?: ClassSummary[];
      items?: ClassSummary[];
    }>("/Classes", {
      params: {
        SubjectId: subjectId,
        SemesterId: semesterId,
        pageNumber: 1,
        pageSize: 100,
      },
    });

    const data = response.data;
    if (Array.isArray(data?.data)) {
      return data.data;
    }
    if (Array.isArray(data?.items)) {
      return data.items;
    }
    return [];
  } catch (error) {
    console.error("Error fetching classes:", error);
    return [];
  }
};

export const getClassSlots = async (classId: string): Promise<SlotDto[]> => {
  try {
    const response = await api.get<{
      success: boolean;
      data: SlotDto[];
    }>(`/Classes/${classId}/slots`);
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching class slots:", error);
    return [];
  }
};

export const getClassRoster = async (classId: string): Promise<number> => {
  try {
    const response = await api.get<{
      success: boolean;
      data: Array<{ studentId: string }>;
    }>(`/Classes/${classId}/students`);
    return response.data.data?.length || 0;
  } catch (error) {
    console.error("Error fetching class roster:", error);
    return 0;
  }
};

