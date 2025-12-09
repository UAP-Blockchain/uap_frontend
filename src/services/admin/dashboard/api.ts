import api from "../../../config/axios";
import { fetchSpecializationsApi } from "../specializations/api";
import { fetchClassesApi } from "../classes/api";
import { fetchSubjectsApi } from "../subjects/api";
import { fetchUsersApi } from "../users/api";

export interface DashboardStatistics {
  activeSpecializations: number;
  activeClasses: number;
  activeSubjects: number;
  activeTeachers: number;
  activeStudents: number;
  totalCreditsIssued: number;
  gpaDistribution: {
    excellent: number; // >= 8.5
    good: number; // 7.0 - 8.4
    average: number; // 5.5 - 6.9
    belowAverage: number; // < 5.5
  };
}

/**
 * Get dashboard statistics for admin
 */
export const getDashboardStatisticsApi = async (): Promise<DashboardStatistics> => {
  try {
    // Fetch all statistics in parallel
    const [
      specializationsRes,
      classesRes,
      subjectsRes,
      teachersRes,
      studentsRes,
    ] = await Promise.all([
      // Active specializations
      fetchSpecializationsApi({ pageNumber: 1, pageSize: 1, isActive: true }),
      // Active classes
      fetchClassesApi({ page: 1, pageSize: 1 }),
      // Active subjects
      fetchSubjectsApi({ pageNumber: 1, pageSize: 1 }),
      // Active teachers
      fetchUsersApi({ roleName: "Teacher", isActive: true, page: 1, pageSize: 1 }),
      // Active students
      fetchUsersApi({ roleName: "Student", isActive: true, page: 1, pageSize: 1 }),
    ]);

    // Get total counts
    const activeSpecializations = specializationsRes.totalCount || 0;
    const activeClasses = classesRes.totalCount || 0;
    const activeSubjects = subjectsRes.totalCount || 0;
    const activeTeachers = teachersRes.totalCount || 0;
    const activeStudents = studentsRes.totalCount || 0;

    // TODO: Fetch total credits issued from API when available
    // For now, we'll need to calculate from enrollments or grades
    const totalCreditsIssued = 0; // Placeholder

    // TODO: Fetch GPA distribution from API when available
    // For now, return placeholder data
    const gpaDistribution = {
      excellent: 0,
      good: 0,
      average: 0,
      belowAverage: 0,
    };

    return {
      activeSpecializations,
      activeClasses,
      activeSubjects,
      activeTeachers,
      activeStudents,
      totalCreditsIssued,
      gpaDistribution,
    };
  } catch (error) {
    console.error("Error fetching dashboard statistics:", error);
    throw error;
  }
};

