export interface CurriculumRoadmapSubjectDto {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  credits: number;
  status: "Open" | "InProgress" | "Locked" | "Completed";
  finalScore: number | null;
  currentClassId: string | null;
  currentClassCode: string | null;
  currentSemesterId: string | null;
  currentSemesterName: string | null;
  prerequisiteSubjectCode: string | null;
  prerequisitesMet: boolean;
  attendancePercentage: number | null;
  attendanceRequirementMet: boolean;
  notes: string | null;
}

export interface CurriculumRoadmapSemesterDto {
  semesterNumber: number;
  subjects: CurriculumRoadmapSubjectDto[];
}

export interface CurriculumRoadmapDto {
  studentId: string;
  studentCode: string;
  studentName: string;
  curriculumId: number;
  curriculumCode: string;
  curriculumName: string;
  totalSubjects: number;
  completedSubjects: number;
  failedSubjects: number;
  inProgressSubjects: number;
  openSubjects: number;
  lockedSubjects: number;
  semesters: CurriculumRoadmapSemesterDto[];
}

// Legacy types for backward compatibility
export interface RoadmapSubjectDto {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  credits: number;
  semesterId: string;
  semesterName: string;
  semesterCode: string;
  sequenceOrder: number;
  status: "Completed" | "InProgress" | "Planned" | "Failed";
  finalScore?: number | null;
  letterGrade?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  notes?: string | null;
}

export interface SemesterRoadmapGroupDto {
  semesterId: string;
  semesterName: string;
  semesterCode: string;
  startDate?: string | null;
  endDate?: string | null;
  isCurrentSemester: boolean;
  subjects: RoadmapSubjectDto[];
}

export interface StudentRoadmapDto {
  studentId: string;
  studentCode: string;
  studentName: string;
  totalSubjects: number;
  completedSubjects: number;
  inProgressSubjects: number;
  plannedSubjects: number;
  failedSubjects: number;
  completionPercentage: number;
  semesterGroups: SemesterRoadmapGroupDto[];
}

