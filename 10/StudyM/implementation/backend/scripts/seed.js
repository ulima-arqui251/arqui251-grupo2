import sequelize from '../src/config/database.js';
import { User, Course, Lesson, Achievement, UserStats } from '../src/models/index.js';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();

    console.log('🌱 Iniciando seeders...');

    // Crear usuarios de prueba
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const users = await User.bulkCreate([
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@studymate.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        emailVerified: true
      },
      {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'teacher@studymate.com',
        password: hashedPassword,
        role: 'teacher',
        isActive: true,
        emailVerified: true
      },
      {
        firstName: 'María',
        lastName: 'García',
        email: 'student@studymate.com',
        password: hashedPassword,
        role: 'student',
        isActive: true,
        emailVerified: true
      },
      {
        firstName: 'Carlos',
        lastName: 'López',
        email: 'student2@studymate.com',
        password: hashedPassword,
        role: 'student',
        isActive: true,
        emailVerified: true
      }
    ], { ignoreDuplicates: true });

    console.log('✅ Usuarios creados');

    // Crear cursos de prueba
    const courses = await Course.bulkCreate([
      {
        title: 'Introducción a JavaScript',
        description: 'Aprende los fundamentos de JavaScript desde cero',
        subject: 'programming',
        difficulty: 'beginner',
        estimatedHours: 20,
        isPublished: true,
        createdBy: users[1]?.id || 1 // Teacher
      },
      {
        title: 'Matemáticas Avanzadas',
        description: 'Conceptos avanzados de cálculo y álgebra',
        subject: 'mathematics',
        difficulty: 'advanced',
        estimatedHours: 40,
        isPublished: true,
        createdBy: users[1]?.id || 1 // Teacher
      },
      {
        title: 'Historia Universal',
        description: 'Un recorrido por la historia de la humanidad',
        subject: 'history',
        difficulty: 'intermediate',
        estimatedHours: 30,
        isPublished: true,
        createdBy: users[1]?.id || 1 // Teacher
      }
    ], { ignoreDuplicates: true });

    console.log('✅ Cursos creados');

    // Crear lecciones de prueba
    const lessons = await Lesson.bulkCreate([
      {
        title: 'Variables y Tipos de Datos',
        description: 'Aprende sobre variables, let, const y tipos de datos en JavaScript',
        content: 'En JavaScript, puedes declarar variables usando var, let o const...',
        courseId: courses[0]?.id || 1,
        order: 1,
        duration: 15,
        isPublished: true,
        createdBy: users[1]?.id || 1
      },
      {
        title: 'Funciones en JavaScript',
        description: 'Comprende cómo crear y usar funciones',
        content: 'Las funciones son bloques de código reutilizable...',
        courseId: courses[0]?.id || 1,
        order: 2,
        duration: 20,
        isPublished: true,
        createdBy: users[1]?.id || 1
      },
      {
        title: 'Límites y Derivadas',
        description: 'Conceptos fundamentales del cálculo diferencial',
        content: 'Un límite describe el comportamiento de una función...',
        courseId: courses[1]?.id || 2,
        order: 1,
        duration: 45,
        isPublished: true,
        createdBy: users[1]?.id || 1
      }
    ], { ignoreDuplicates: true });

    console.log('✅ Lecciones creadas');

    // Crear logros de prueba
    await Achievement.bulkCreate([
      {
        name: 'Primera Lección',
        description: 'Completa tu primera lección',
        type: 'lesson_completion',
        requirement: 1,
        points: 50,
        icon: '🎯'
      },
      {
        name: 'Estudiante Dedicado',
        description: 'Completa 10 lecciones',
        type: 'lesson_completion',
        requirement: 10,
        points: 200,
        icon: '📚'
      },
      {
        name: 'Experto en JavaScript',
        description: 'Completa el curso de JavaScript',
        type: 'course_completion',
        requirement: 1,
        points: 500,
        icon: '🏆'
      },
      {
        name: 'Miembro Activo',
        description: 'Crea tu primer post en la comunidad',
        type: 'community_participation',
        requirement: 1,
        points: 100,
        icon: '💬'
      }
    ], { ignoreDuplicates: true });

    console.log('✅ Logros creados');

    // Crear estadísticas iniciales para los usuarios
    for (const user of users) {
      await UserStats.findOrCreate({
        where: { userId: user.id },
        defaults: {
          userId: user.id,
          totalPoints: user.role === 'student' ? Math.floor(Math.random() * 500) : 0,
          lessonsCompleted: user.role === 'student' ? Math.floor(Math.random() * 10) : 0,
          coursesCompleted: 0,
          streakDays: user.role === 'student' ? Math.floor(Math.random() * 7) : 0,
          level: 1
        }
      });
    }

    console.log('✅ Estadísticas de usuario creadas');

    console.log('🎉 Seeders completados exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante los seeders:', error);
    process.exit(1);
  }
}

seed();
