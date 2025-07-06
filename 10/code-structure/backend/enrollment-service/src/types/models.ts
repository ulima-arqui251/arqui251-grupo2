import { Request } from 'express';
import { AuthUser } from './common';

export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
  CANCELLED = 'cancelled'
}

export enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export interface EnrollmentData {
  id?: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
  completedAt?: Date;
  droppedAt?: Date;
  cancelledAt?: Date;
  progress: number;
  paymentStatus: PaymentStatus;
  paymentAmount?: number;
  paymentMethod?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CourseCapacityData {
  id?: string;
  courseId: string;
  maxCapacity: number;
  currentEnrollments: number;
  allowWaitlist: boolean;
  waitlistCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EnrollmentHistoryData {
  id?: string;
  enrollmentId: string;
  previousStatus: EnrollmentStatus;
  newStatus: EnrollmentStatus;
  reason?: string;
  changedBy: string;
  changedAt: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WaitlistData {
  id?: string;
  userId: string;
  courseId: string;
  position: number;
  priority: number;
  joinedAt: Date;
  requestedAt: Date;
  notified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Tipos para requests del controlador
export interface CreateEnrollmentData {
  courseId: string;
  paymentMethod?: string;
  notes?: string;
}

export interface UpdateEnrollmentData {
  status?: EnrollmentStatus;
  paymentStatus?: PaymentStatus;
  reason?: string;
  notes?: string;
}

// Tipo para request autenticado
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

// Tipos para respuestas de la API
export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationResponse<T = any> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
