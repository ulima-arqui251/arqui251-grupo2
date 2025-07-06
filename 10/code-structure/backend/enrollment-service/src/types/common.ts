export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface EnrollmentFilters {
  userId?: string;
  courseId?: string;
  status?: string;
  paymentStatus?: string;
  enrolledAfter?: Date;
  enrolledBefore?: Date;
  search?: string;
}

export interface CourseInfo {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  price: number;
  level: string;
  isActive: boolean;
  maxStudents?: number;
}

export interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

export interface EnrollmentStats {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  droppedEnrollments: number;
  averageProgress: number;
  totalRevenue: number;
}

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
