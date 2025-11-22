interface Teacher {
  id: string;
  teacherCode: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  address?: string;
  department: string;
  position: string;
  title: 'Mr' | 'Mrs' | 'Ms' | 'Dr' | 'Prof';
  specialization: string[];
  classIds: string[];
  hireDate: string;
  status: 'active' | 'inactive' | 'retired';
  walletAddress?: string;
  profileImage?: string;
  yearsOfExperience?: number;
  qualifications: string[];
  createdAt: string;
  updatedAt: string;
}

interface TeacherFormData {
  teacherCode: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: Date;
  address?: string;
  department: string;
  position: string;
  title: 'Mr' | 'Mrs' | 'Ms' | 'Dr' | 'Prof';
  specialization: string[];
  qualifications: string[];
  status: 'active' | 'inactive' | 'retired';
}

export interface TeacherOption {
  id: string;
  teacherCode: string;
  fullName: string;
}

export interface TeacherClassSummaryDto {
  classId: string;
  classCode: string;
  subjectName: string;
  subjectCode: string;
  credits: number;
  semesterName: string;
  totalStudents: number;
  totalSlots: number;
}

export interface TeacherProfileDto {
  id: string;
  teacherCode: string;
  fullName: string;
  email: string;
  hireDate: string;
  specialization: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt: string;
  classes: TeacherClassSummaryDto[];
  totalClasses: number;
  totalStudents: number;
}

export type { Teacher, TeacherFormData };