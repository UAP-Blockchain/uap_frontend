export interface Class {
  id: string;
  classCode: string;
  className: string;
  courseCode: string;
  courseName: string;
  description?: string;
  teacherId: string;
  teacherName: string;
  studentIds: string[];
  maxStudents: number;
  credits: number;
  schedule: ClassSchedule[];
  startDate: string;
  endDate: string;
  semester: string;
  academicYear: string;
  status: "active" | "inactive" | "completed" | "cancelled";
  room?: string;
  department: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassSchedule {
  dayOfWeek:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  startTime: string;
  endTime: string;
  room?: string;
}

export interface ClassFormData {
  classCode: string;
  className: string;
  courseCode: string;
  courseName: string;
  description?: string;
  teacherId: string;
  maxStudents: number;
  credits: number;
  schedule: ClassSchedule[];
  startDate: string;
  endDate: string;
  semester: string;
  academicYear: string;
  room?: string;
  department: string;
  status: "active" | "inactive" | "completed" | "cancelled";
}

export interface ClassSummary {
  maxEnrollment: number;
  id: string;
  classCode: string;
  subjectName: string;
  subjectCode: string;
  credits: number;
  teacherName: string;
  teacherCode: string;
  semesterName: string;
  totalStudents: number;
  totalEnrollments: number;
  totalSlots: number;
  currentEnrollment: number;
  subjectOfferingId?: string;
  onChainClassId?: number | null;
  teacherWalletAddress?: string | null;
}

export interface ClassesApiResponse {
  items?: ClassSummary[];
  data?: ClassSummary[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface GetClassesRequest {
  subjectId?: string;
  teacherId?: string;
  semesterId?: string;
  classCode?: string;
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface CreateClassSlotRequest {
  date: string;
  timeSlotId?: string;
  substituteTeacherId?: string;
  substitutionReason?: string;
  notes?: string;
}

export interface CreateClassRequest {
  classCode: string;
  subjectOfferingId: string;
  teacherId: string;
  maxEnrollment?: number;
  initialSlots?: CreateClassSlotRequest[];
}

export interface UpdateClassRequest extends CreateClassRequest {}

export interface EligibleStudent {
  id?: string;
  studentId: string;
  studentCode: string;
  fullName: string;
  email: string;
  gpa?: number;
  major?: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  note?: string;
  markedBy: string;
  markedAt: string;
}

export interface Grade {
  id: string;
  studentId: string;
  classId: string;
  courseCode: string;
  gradeType: "midterm" | "final" | "assignment" | "quiz" | "project";
  score: number;
  maxScore: number;
  weight: number;
  date: string;
  note?: string;
  gradedBy: string;
  gradedAt: string;
}

