interface Class {
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
  status: 'active' | 'inactive' | 'completed' | 'cancelled';
  room?: string;
  department: string;
  createdAt: string;
  updatedAt: string;
}

interface ClassSchedule {
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
  room?: string;
}

interface ClassFormData {
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
  status: 'active' | 'inactive' | 'completed' | 'cancelled';
}

interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  note?: string;
  markedBy: string;
  markedAt: string;
}

interface Grade {
  id: string;
  studentId: string;
  classId: string;
  courseCode: string;
  gradeType: 'midterm' | 'final' | 'assignment' | 'quiz' | 'project';
  score: number;
  maxScore: number;
  weight: number;
  date: string;
  note?: string;
  gradedBy: string;
  gradedAt: string;
}

export type { Class, ClassSchedule, ClassFormData, Attendance, Grade };