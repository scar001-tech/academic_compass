// User Roles and Permissions
export enum UserRole {
  PRINCIPAL = 'PRINCIPAL',              // Overall admin - full access
  SENIOR_TEACHER = 'SENIOR_TEACHER',    // Manage timetable, students, assign teachers
  TEACHER = 'TEACHER',                  // Add marks, comments
  DEPARTMENT_HEAD = 'DEPARTMENT_HEAD',
  VICE_PRINCIPAL = 'VICE_PRINCIPAL',
  PARENT = 'PARENT',
  STUDENT = 'STUDENT',
  LIBRARIAN = 'LIBRARIAN',
  ACCOUNTANT = 'ACCOUNTANT',
}

// Permission levels
export enum Permission {
  // Student Management
  VIEW_STUDENTS = 'view_students',
  CREATE_STUDENT = 'create_student',
  EDIT_STUDENT = 'edit_student',
  DELETE_STUDENT = 'delete_student',

  // Timetable Management
  VIEW_TIMETABLE = 'view_timetable',
  EDIT_TIMETABLE = 'edit_timetable',
  CREATE_TIMETABLE = 'create_timetable',

  // Teacher Management
  ASSIGN_TEACHERS = 'assign_teachers',
  VIEW_TEACHERS = 'view_teachers',
  MANAGE_TEACHERS = 'manage_teachers',

  // Marks & Assessment
  VIEW_MARKS = 'view_marks',
  ADD_MARKS = 'add_marks',
  EDIT_MARKS = 'edit_marks',
  DELETE_MARKS = 'delete_marks',

  // Comments
  ADD_COMMENTS = 'add_comments',
  EDIT_COMMENTS = 'edit_comments',

  // System Administration
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  MANAGE_USERS = 'manage_users',
  MANAGE_SYSTEM = 'manage_system',
  VIEW_REPORTS = 'view_reports',
}

// Role-to-Permissions mapping
export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.PRINCIPAL]: [
    // Full access
    Permission.VIEW_STUDENTS,
    Permission.CREATE_STUDENT,
    Permission.EDIT_STUDENT,
    Permission.DELETE_STUDENT,
    Permission.VIEW_TIMETABLE,
    Permission.EDIT_TIMETABLE,
    Permission.CREATE_TIMETABLE,
    Permission.ASSIGN_TEACHERS,
    Permission.VIEW_TEACHERS,
    Permission.MANAGE_TEACHERS,
    Permission.VIEW_MARKS,
    Permission.ADD_MARKS,
    Permission.EDIT_MARKS,
    Permission.DELETE_MARKS,
    Permission.ADD_COMMENTS,
    Permission.EDIT_COMMENTS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.MANAGE_USERS,
    Permission.MANAGE_SYSTEM,
    Permission.VIEW_REPORTS,
  ],

  [UserRole.SENIOR_TEACHER]: [
    // Can manage students, timetable, and teachers
    Permission.VIEW_STUDENTS,
    Permission.CREATE_STUDENT,
    Permission.EDIT_STUDENT,
    Permission.DELETE_STUDENT,
    Permission.VIEW_TIMETABLE,
    Permission.EDIT_TIMETABLE,
    Permission.CREATE_TIMETABLE,
    Permission.ASSIGN_TEACHERS,
    Permission.VIEW_TEACHERS,
    Permission.VIEW_MARKS,
    Permission.ADD_MARKS,
    Permission.EDIT_MARKS,
    Permission.ADD_COMMENTS,
    Permission.EDIT_COMMENTS,
  ],

  [UserRole.TEACHER]: [
    // Can only add marks and comments
    Permission.VIEW_MARKS,
    Permission.ADD_MARKS,
    Permission.ADD_COMMENTS,
    Permission.VIEW_STUDENTS,
  ],

  [UserRole.DEPARTMENT_HEAD]: [
    Permission.VIEW_STUDENTS,
    Permission.VIEW_TIMETABLE,
    Permission.VIEW_TEACHERS,
    Permission.VIEW_MARKS,
    Permission.ADD_COMMENTS,
    Permission.VIEW_REPORTS,
  ],

  [UserRole.VICE_PRINCIPAL]: [
    Permission.VIEW_STUDENTS,
    Permission.EDIT_STUDENT,
    Permission.VIEW_TIMETABLE,
    Permission.VIEW_TEACHERS,
    Permission.MANAGE_TEACHERS,
    Permission.VIEW_MARKS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.VIEW_REPORTS,
  ],

  [UserRole.PARENT]: [],
  [UserRole.STUDENT]: [],
  [UserRole.LIBRARIAN]: [],
  [UserRole.ACCOUNTANT]: [Permission.VIEW_REPORTS],
}

// User Types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  avatar?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AuthToken {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: AuthToken
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Student Types
export interface Student {
  id: string
  registrationNumber: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  classId: string
  admissionDate: Date
  parentId?: string
}

// Teacher Types
export interface Teacher {
  id: string
  employeeNumber: string
  firstName: string
  lastName: string
  email: string
  departmentId: string
  qualifications: string[]
  specializations: string[]
  employmentDate: Date
}

// Class Types
export interface Class {
  id: string
  name: string
  description?: string
  departmentId: string
  classTeacherId?: string
  studentCount: number
}

// Subject Types
export interface Subject {
  id: string
  name: string
  code: string
  departmentId: string
  description?: string
}

// Mark Types
export interface Mark {
  id: string
  studentId: string
  examId: string
  subjectId: string
  score: number
  percentage: number
  grade: string
  remarks?: string
}
