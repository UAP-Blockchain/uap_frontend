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

export type { Teacher, TeacherFormData, TeacherOption };