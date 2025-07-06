import { CourseStatus, LessonType, MaterialType, QuizType, DifficultyLevel } from './common';

export interface CourseAttributes {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  categoryId?: string;
  status: CourseStatus;
  difficultyLevel: DifficultyLevel;
  duration?: number; // in minutes
  price?: number;
  thumbnailUrl?: string;
  previewVideoUrl?: string;
  requirements?: string[];
  learningOutcomes?: string[];
  tags?: string[];
  maxStudents?: number;
  currentStudents?: number;
  averageRating?: number;
  totalRatings?: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseCreationAttributes extends Omit<CourseAttributes, 'id' | 'createdAt' | 'updatedAt' | 'currentStudents' | 'averageRating' | 'totalRatings'> {}

export interface LessonAttributes {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  type: LessonType;
  content?: string; // HTML content for text lessons
  videoUrl?: string;
  duration?: number; // in minutes
  orderIndex: number;
  isPreview: boolean; // if lesson can be viewed without enrollment
  isCompleted?: boolean; // calculated field for specific user
  createdAt: Date;
  updatedAt: Date;
}

export interface LessonCreationAttributes extends Omit<LessonAttributes, 'id' | 'createdAt' | 'updatedAt' | 'isCompleted'> {}

export interface MaterialAttributes {
  id: string;
  lessonId?: string;
  courseId?: string; // can be attached to course directly
  title: string;
  description?: string;
  type: MaterialType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  externalUrl?: string; // for links
  orderIndex?: number;
  isDownloadable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaterialCreationAttributes extends Omit<MaterialAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export interface QuizAttributes {
  id: string;
  lessonId?: string;
  courseId?: string; // can be attached to course directly
  title: string;
  description?: string;
  instructions?: string;
  timeLimit?: number; // in minutes
  passingScore?: number; // percentage (0-100)
  maxAttempts?: number;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  isGraded: boolean;
  orderIndex?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizCreationAttributes extends Omit<QuizAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export interface QuestionAttributes {
  id: string;
  quizId: string;
  type: QuizType;
  question: string;
  explanation?: string;
  points: number;
  orderIndex: number;
  options?: QuestionOption[]; // for multiple choice, true/false
  correctAnswer?: string | string[]; // depends on question type
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionCreationAttributes extends Omit<QuestionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface CategoryAttributes {
  id: string;
  name: string;
  description?: string;
  parentId?: string; // for subcategories
  slug: string;
  isActive: boolean;
  orderIndex?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryCreationAttributes extends Omit<CategoryAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export interface TagAttributes {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  isActive: boolean;
  usageCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TagCreationAttributes extends Omit<TagAttributes, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'> {}

export interface CourseEnrollmentAttributes {
  id: string;
  courseId: string;
  studentId: string;
  enrolledAt: Date;
  completedAt?: Date;
  progress: number; // percentage (0-100)
  lastAccessedAt?: Date;
  certificateUrl?: string;
  isActive: boolean;
}

export interface CourseEnrollmentCreationAttributes extends Omit<CourseEnrollmentAttributes, 'id' | 'completedAt' | 'progress' | 'lastAccessedAt' | 'certificateUrl'> {}

export interface LessonProgressAttributes {
  id: string;
  lessonId: string;
  studentId: string;
  courseId: string;
  isCompleted: boolean;
  completedAt?: Date;
  timeSpent?: number; // in minutes
  lastAccessedAt?: Date;
  progress: number; // percentage (0-100)
}

export interface LessonProgressCreationAttributes extends Omit<LessonProgressAttributes, 'id' | 'completedAt' | 'lastAccessedAt'> {}

export interface QuizAttemptAttributes {
  id: string;
  quizId: string;
  studentId: string;
  courseId: string;
  startedAt: Date;
  completedAt?: Date;
  score?: number; // percentage (0-100)
  totalQuestions: number;
  correctAnswers: number;
  answers: QuizAnswer[];
  isPassed: boolean;
  attemptNumber: number;
  timeSpent?: number; // in minutes
}

export interface QuizAttemptCreationAttributes extends Omit<QuizAttemptAttributes, 'id' | 'completedAt' | 'score' | 'correctAnswers' | 'isPassed' | 'timeSpent' | 'startedAt' | 'attemptNumber'> {
  startedAt?: Date;
  attemptNumber?: number;
}

export interface QuizAnswer {
  questionId: string;
  answer: string | string[];
  isCorrect: boolean;
  points: number;
}

// Request/Response interfaces for API endpoints
export interface CreateCourseRequest extends CourseCreationAttributes {}

export interface UpdateCourseRequest extends Partial<CourseCreationAttributes> {}

export interface CreateLessonRequest extends LessonCreationAttributes {}

export interface UpdateLessonRequest extends Partial<LessonCreationAttributes> {}

export interface CreateMaterialRequest extends MaterialCreationAttributes {}

export interface UpdateMaterialRequest extends Partial<MaterialCreationAttributes> {}

export interface CreateQuizRequest extends QuizCreationAttributes {
  questions?: QuestionCreationAttributes[];
}

export interface UpdateQuizRequest extends Partial<QuizCreationAttributes> {
  questions?: Partial<QuestionCreationAttributes>[];
}

export interface CourseSearchFilters {
  category?: string;
  instructor?: string;
  difficultyLevel?: DifficultyLevel;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  status?: CourseStatus;
  tags?: string[];
  search?: string;
}
