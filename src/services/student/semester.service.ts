import api from "../../config/axios";
import type { SemesterDto, GetSemestersRequest } from "../../types/Semester";

export const getUpcomingSemester = async (): Promise<SemesterDto | null> => {
  try {
    const response = await api.get<{
      data: SemesterDto[];
      totalCount: number;
    }>("/Semesters", {
      params: {
        pageNumber: 1,
        pageSize: 100,
      } as GetSemestersRequest,
    });

    const semesters = response.data.data || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find upcoming semester (startDate >= today)
    const upcoming = semesters.find((sem) => {
      if (!sem.isActive) return false;
      const startDate = new Date(sem.startDate);
      startDate.setHours(0, 0, 0, 0);
      return startDate >= today;
    });

    if (upcoming) {
      return upcoming;
    }

    // Fallback: get most recent active semester
    const activeSemesters = semesters
      .filter((sem) => sem.isActive)
      .sort((a, b) => {
        const dateA = new Date(a.startDate).getTime();
        const dateB = new Date(b.startDate).getTime();
        return dateB - dateA;
      });

    return activeSemesters[0] || null;
  } catch (error) {
    console.error("Error fetching upcoming semester:", error);
    return null;
  }
};

