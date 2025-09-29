interface Student {
  id: string;
  studentCode: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  address?: string;
  classIds: string[];
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'graduated' | 'suspended';
  walletAddress?: string;
  profileImage?: string;
  gpa?: number;
  totalCredits?: number;
  major: string;
  year: number;
  createdAt: string;
  updatedAt: string;
}

interface StudentFormData {
  studentCode: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: Date;
  address?: string;
  major: string;
  year: number;
  status: 'active' | 'inactive' | 'graduated' | 'suspended';
}

export type { Student, StudentFormData };