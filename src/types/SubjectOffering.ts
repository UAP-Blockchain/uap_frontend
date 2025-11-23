export interface SubjectOffering {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  credits: number;
  semesterId: string;
  semesterName: string;
  maxClasses: number;
  semesterCapacity: number;
  registrationStartDate?: string;
  registrationEndDate?: string;
  isActive: boolean;
  notes?: string;
  totalClasses?: number;
  totalStudents?: number;
}


