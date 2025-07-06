// Modelo principal que exporta todos los modelos de Sequelize
import { Sequelize } from 'sequelize';
import { initCourse, Course } from './Course';
import { initLesson, Lesson } from './Lesson';
import { initMaterial, Material } from './Material';
import { initQuiz, Quiz } from './Quiz';
import { initQuestion, Question } from './Question';
import { initCourseEnrollment, CourseEnrollment } from './CourseEnrollment';
import { initLessonProgress, LessonProgress } from './LessonProgress';
import { initQuizAttempt, QuizAttempt } from './QuizAttempt';
import { initCategory, Category } from './Category';

// Función para inicializar todos los modelos
export const initModels = (sequelize: Sequelize) => {
  // Inicializar modelos
  initCourse(sequelize);
  initLesson(sequelize);
  initMaterial(sequelize);
  initQuiz(sequelize);
  initQuestion(sequelize);
  initCourseEnrollment(sequelize);
  initLessonProgress(sequelize);
  initQuizAttempt(sequelize);
  initCategory(sequelize);

  // Establecer asociaciones
  Course.associate({
    Lesson,
    Material,
    Quiz,
    Category,
    CourseEnrollment
    // Tag // TODO: Implement Tag model
  });

  Lesson.associate({
    Course,
    Material,
    Quiz,
    LessonProgress
  });

  Material.associate({
    Lesson,
    Course
  });

  Quiz.associate({
    Lesson,
    Course,
    Question,
    QuizAttempt
  });

  Question.associate({
    Quiz
  });

  CourseEnrollment.associate({
    Course
  });

  LessonProgress.associate({
    Lesson,
    Course
  });

  QuizAttempt.associate({
    Quiz,
    Course
  });

  Category.associate({
    Course,
    Category
  });

  return {
    Course,
    Lesson,
    Material,
    Quiz,
    Question,
    CourseEnrollment,
    LessonProgress,
    QuizAttempt,
    Category
    // Tag // TODO: Implement Tag model
  };
};

// Exportar modelos individualmente
export {
  Course,
  Lesson,
  Material,
  Quiz,
  Question,
  CourseEnrollment,
  LessonProgress,
  QuizAttempt,
  Category
};
