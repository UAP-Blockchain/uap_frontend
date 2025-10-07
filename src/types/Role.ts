interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
  status: 'active' | 'inactive';
}

const DEFAULT_PERMISSIONS: Permission[] = [
  {
    id: '1',
    name: 'manage_students',
    description: 'Quản lý sinh viên',
    resource: 'students',
    action: 'manage'
  },
  {
    id: '2',
    name: 'manage_teachers',
    description: 'Quản lý giảng viên',
    resource: 'teachers',
    action: 'manage'
  },
  {
    id: '3',
    name: 'manage_classes',
    description: 'Quản lý lớp học',
    resource: 'classes',
    action: 'manage'
  },
  {
    id: '4',
    name: 'manage_grades',
    description: 'Quản lý điểm số',
    resource: 'grades',
    action: 'manage'
  },
  {
    id: '5',
    name: 'manage_attendance',
    description: 'Quản lý điểm danh',
    resource: 'attendance',
    action: 'manage'
  },
  {
    id: '6',
    name: 'manage_credentials',
    description: 'Quản lý chứng chỉ',
    resource: 'credentials',
    action: 'manage'
  },
  {
    id: '7',
    name: 'view_reports',
    description: 'Xem báo cáo',
    resource: 'reports',
    action: 'read'
  }
];

export type { Role, RoleFormData, Permission };
export { DEFAULT_PERMISSIONS };