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

