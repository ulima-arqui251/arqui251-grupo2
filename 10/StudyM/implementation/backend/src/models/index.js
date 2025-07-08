import User from './User.js';
import Course from './Course.js';
import Lesson from './Lesson.js';
import LessonProgress from './LessonProgress.js';
import UserStats from './UserStats.js';
import Achievement from './Achievement.js';
import UserAchievement from './UserAchievement.js';
import PointsTransaction from './PointsTransaction.js';
import Leaderboard from './Leaderboard.js';
import Post from './Post.js';
import Comment from './Comment.js';
import PostLike from './PostLike.js';
import CommentLike from './CommentLike.js';
import StudyGroup from './StudyGroup.js';
import StudyGroupMember from './StudyGroupMember.js';
// Nuevos modelos para Panel Docente
import Assignment from './Assignment.js';
import Submission from './Submission.js';
import Grade from './Grade.js';
import Enrollment from './Enrollment.js';

// Relaciones Usuario-Curso
User.hasMany(Course, { foreignKey: 'createdBy', as: 'createdCourses' });
Course.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Relaciones Curso-Lección
Course.hasMany(Lesson, { foreignKey: 'courseId', as: 'lessons' });
Lesson.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Relaciones Usuario-Progreso
User.hasMany(LessonProgress, { foreignKey: 'userId', as: 'lessonProgress' });
LessonProgress.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Relaciones Lección-Progreso
Lesson.hasMany(LessonProgress, { foreignKey: 'lessonId', as: 'progress' });
LessonProgress.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' });

// Relaciones de Gamificación
User.hasOne(UserStats, { foreignKey: 'userId', as: 'stats' });
UserStats.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(UserAchievement, { foreignKey: 'userId', as: 'achievements' });
UserAchievement.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Achievement.hasMany(UserAchievement, { foreignKey: 'achievementId', as: 'userAchievements' });
UserAchievement.belongsTo(Achievement, { foreignKey: 'achievementId', as: 'achievement' });

User.hasMany(PointsTransaction, { foreignKey: 'userId', as: 'pointsTransactions' });
PointsTransaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Relaciones de Comunidad
User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'userId', as: 'author' });

User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });

Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

User.hasMany(PostLike, { foreignKey: 'userId', as: 'postLikes' });
PostLike.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Post.hasMany(PostLike, { foreignKey: 'postId', as: 'likes' });
PostLike.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

User.hasMany(CommentLike, { foreignKey: 'userId', as: 'commentLikes' });
CommentLike.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Comment.hasMany(CommentLike, { foreignKey: 'commentId', as: 'likes' });
CommentLike.belongsTo(Comment, { foreignKey: 'commentId', as: 'comment' });

// Relaciones de Grupos de Estudio
User.hasMany(StudyGroup, { foreignKey: 'ownerId', as: 'ownedGroups' });
StudyGroup.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

User.hasMany(StudyGroupMember, { foreignKey: 'userId', as: 'groupMemberships' });
StudyGroupMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });

StudyGroup.hasMany(StudyGroupMember, { foreignKey: 'studyGroupId', as: 'members' });
StudyGroupMember.belongsTo(StudyGroup, { foreignKey: 'studyGroupId', as: 'group' });

// Relaciones Panel Docente
// Relaciones Assignment
User.hasMany(Assignment, { foreignKey: 'createdBy', as: 'assignments' });
Assignment.belongsTo(User, { foreignKey: 'createdBy', as: 'teacher' });

Course.hasMany(Assignment, { foreignKey: 'courseId', as: 'assignments' });
Assignment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Relaciones Submission
User.hasMany(Submission, { foreignKey: 'studentId', as: 'submissions' });
Submission.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

User.hasMany(Submission, { foreignKey: 'gradedBy', as: 'gradedSubmissions' });
Submission.belongsTo(User, { foreignKey: 'gradedBy', as: 'grader' });

Assignment.hasMany(Submission, { foreignKey: 'assignmentId', as: 'submissions' });
Submission.belongsTo(Assignment, { foreignKey: 'assignmentId', as: 'assignment' });

// Relaciones Grade
User.hasMany(Grade, { foreignKey: 'studentId', as: 'grades' });
Grade.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

User.hasMany(Grade, { foreignKey: 'teacherId', as: 'gradesGiven' });
Grade.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });

Course.hasMany(Grade, { foreignKey: 'courseId', as: 'grades' });
Grade.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

Assignment.hasMany(Grade, { foreignKey: 'assignmentId', as: 'grades' });
Grade.belongsTo(Assignment, { foreignKey: 'assignmentId', as: 'assignment' });

// Relaciones Enrollment
User.hasMany(Enrollment, { foreignKey: 'studentId', as: 'enrollments' });
Enrollment.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

Course.hasMany(Enrollment, { foreignKey: 'courseId', as: 'enrollments' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

export {
  User,
  Course,
  Lesson,
  LessonProgress,
  UserStats,
  Achievement,
  UserAchievement,
  PointsTransaction,
  Leaderboard,
  Post,
  Comment,
  PostLike,
  CommentLike,
  StudyGroup,
  StudyGroupMember,
  // Nuevos modelos Panel Docente
  Assignment,
  Submission,
  Grade,
  Enrollment
};
