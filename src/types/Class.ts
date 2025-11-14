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
}

export interface ClassesApiResponse {
  items?: ClassSummary[];
  data?: ClassSummary[];
}

export interface CreateClassRequest {
  classCode: string;
  subjectId: string;
  teacherId: string;
}

export interface UpdateClassRequest {
  classCode: string;
  subjectId: string;
  teacherId: string;
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

