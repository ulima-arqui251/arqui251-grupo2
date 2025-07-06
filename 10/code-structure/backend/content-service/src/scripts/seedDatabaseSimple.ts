import { config } from 'dotenv';
import { Sequelize } from 'sequelize';
import { initModels } from '../models';
import { CourseStatus, DifficultyLevel, LessonType } from '../types/common';

// Load environment variables
config();

// Database configuration
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'studymate_dev',
  username: process.env.DB_USER || 'studymate',
  password: process.env.DB_PASSWORD || '12345',
  logging: false
});

// Initialize models
const models = initModels(sequelize);

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed de la base de datos...');
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');

    // Crear categorías
    console.log('📂 Creando categorías...');
    const [programmingCategory] = await models.Category.findOrCreate({
      where: { slug: 'programacion' },
      defaults: {
        name: 'Programación',
        description: 'Cursos de programación y desarrollo de software',
        slug: 'programacion',
        isActive: true,
        orderIndex: 1
      }
    });

    const [designCategory] = await models.Category.findOrCreate({
      where: { slug: 'diseno' },
      defaults: {
        name: 'Diseño',
        description: 'Cursos de diseño gráfico y UX/UI',
        slug: 'diseno',
        isActive: true,
        orderIndex: 2
      }
    });

    const [marketingCategory] = await models.Category.findOrCreate({
      where: { slug: 'marketing' },
      defaults: {
        name: 'Marketing',
        description: 'Cursos de marketing digital y ventas',
        slug: 'marketing',
        isActive: true,
        orderIndex: 3
      }
    });

    console.log('✅ Categorías creadas exitosamente');

    // Crear cursos
    console.log('📚 Creando cursos...');
    const [pythonCourse] = await models.Course.findOrCreate({
      where: { title: 'Curso Completo de Python' },
      defaults: {
        title: 'Curso Completo de Python',
        description: 'Aprende Python desde cero hasta nivel avanzado. Incluye programación orientada a objetos, frameworks web, análisis de datos y más.',
        instructorId: 'b3b6a7e2-1c2d-4e5f-8a9b-1234567890ab', // UUID válido
        categoryId: programmingCategory.id,
        status: CourseStatus.PUBLISHED,
        difficultyLevel: DifficultyLevel.BEGINNER,
        duration: 7200, // 2 horas
        price: 99.99,
        thumbnailUrl: 'https://via.placeholder.com/400x300/3776ab/ffffff?text=Python',
        requirements: ['Conocimientos básicos de computación', 'Ganas de aprender'],
        learningOutcomes: ['Programar en Python', 'Crear aplicaciones web', 'Análisis de datos', 'Automatización de tareas'],
        tags: ['python', 'programación', 'desarrollo', 'backend'],
        maxStudents: 100,
        isPublic: true
      }
    });

    const [reactCourse] = await models.Course.findOrCreate({
      where: { title: 'React.js Moderno' },
      defaults: {
        title: 'React.js Moderno',
        description: 'Domina React.js con hooks, context API, y las mejores prácticas del desarrollo frontend moderno.',
        instructorId: 'c4c7b8f3-2d3e-4f6a-9b0c-abcdef123456', // UUID válido
        categoryId: programmingCategory.id,
        status: CourseStatus.PUBLISHED,
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        duration: 6000, // 1.67 horas
        price: 129.99,
        thumbnailUrl: 'https://via.placeholder.com/400x300/61dafb/000000?text=React',
        requirements: ['JavaScript básico', 'HTML y CSS', 'Conceptos de programación'],
        learningOutcomes: ['Crear aplicaciones React', 'Manejar estado con hooks', 'Conectar con APIs', 'Desplegar aplicaciones'],
        tags: ['react', 'frontend', 'javascript', 'spa'],
        maxStudents: 80,
        isPublic: true
      }
    });

    const [uxCourse] = await models.Course.findOrCreate({
      where: { title: 'Diseño UX/UI Completo' },
      defaults: {
        title: 'Diseño UX/UI Completo',
        description: 'Aprende a diseñar experiencias de usuario excepcionales y interfaces atractivas.',
        instructorId: 'd5d8c9e4-3e4f-5a7b-0c1d-fedcba654321', // UUID válido
        categoryId: designCategory.id,
        status: CourseStatus.PUBLISHED,
        difficultyLevel: DifficultyLevel.BEGINNER,
        duration: 5400, // 1.5 horas
        price: 89.99,
        thumbnailUrl: 'https://via.placeholder.com/400x300/ff6b6b/ffffff?text=UX+Design',
        requirements: ['Creatividad', 'Interés en diseño', 'Computadora con software de diseño'],
        learningOutcomes: ['Crear wireframes', 'Diseñar prototipos', 'Investigación de usuarios', 'Principios de usabilidad'],
        tags: ['ux', 'ui', 'diseño', 'prototipado'],
        maxStudents: 60,
        isPublic: true
      }
    });

    const [marketingCourse] = await models.Course.findOrCreate({
      where: { title: 'Marketing Digital Avanzado' },
      defaults: {
        title: 'Marketing Digital Avanzado',
        description: 'Estrategias de marketing digital para hacer crecer tu negocio online.',
        instructorId: 'e6e9d0f5-4f5a-6b8c-1d2e-654321fedcba', // UUID válido
        categoryId: marketingCategory.id,
        status: CourseStatus.PUBLISHED,
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        duration: 4800, // 1.33 horas
        price: 149.99,
        thumbnailUrl: 'https://via.placeholder.com/400x300/4ecdc4/ffffff?text=Marketing',
        requirements: ['Conocimientos básicos de marketing', 'Negocio o idea de negocio'],
        learningOutcomes: ['Crear campañas efectivas', 'Analizar métricas', 'SEO y SEM', 'Redes sociales'],
        tags: ['marketing', 'digital', 'seo', 'publicidad'],
        maxStudents: 120,
        isPublic: true
      }
    });

    console.log('✅ Cursos creados exitosamente');

    // Crear algunas lecciones para el curso de Python
    console.log('📖 Creando lecciones...');
    await models.Lesson.findOrCreate({
      where: { courseId: pythonCourse.id, title: 'Introducción a Python' },
      defaults: {
        courseId: pythonCourse.id,
        title: 'Introducción a Python',
        description: 'Conoce qué es Python y por qué es tan popular',
        type: LessonType.VIDEO,
        content: 'Contenido de la lección de introducción...',
        videoUrl: 'https://www.youtube.com/watch?v=example1',
        duration: 600, // 10 minutos
        orderIndex: 1,
        isPreview: true
      }
    });

    await models.Lesson.findOrCreate({
      where: { courseId: pythonCourse.id, title: 'Variables y Tipos de Datos' },
      defaults: {
        courseId: pythonCourse.id,
        title: 'Variables y Tipos de Datos',
        description: 'Aprende sobre variables, strings, números y booleanos',
        type: LessonType.VIDEO,
        content: 'Contenido sobre variables y tipos de datos...',
        videoUrl: 'https://www.youtube.com/watch?v=example2',
        duration: 900, // 15 minutos
        orderIndex: 2,
        isPreview: false
      }
    });

    await models.Lesson.findOrCreate({
      where: { courseId: pythonCourse.id, title: 'Estructuras de Control' },
      defaults: {
        courseId: pythonCourse.id,
        title: 'Estructuras de Control',
        description: 'If, else, loops y manejo de flujo de control',
        type: LessonType.VIDEO,
        content: 'Contenido sobre estructuras de control...',
        videoUrl: 'https://www.youtube.com/watch?v=example3',
        duration: 1200, // 20 minutos
        orderIndex: 3,
        isPreview: false
      }
    });

    // Crear lecciones para React
    await models.Lesson.findOrCreate({
      where: { courseId: reactCourse.id, title: 'Introducción a React' },
      defaults: {
        courseId: reactCourse.id,
        title: 'Introducción a React',
        description: 'Qué es React y cómo configurar tu entorno',
        type: LessonType.VIDEO,
        content: 'Contenido de introducción a React...',
        videoUrl: 'https://www.youtube.com/watch?v=react1',
        duration: 720, // 12 minutos
        orderIndex: 1,
        isPreview: true
      }
    });

    await models.Lesson.findOrCreate({
      where: { courseId: reactCourse.id, title: 'Componentes y JSX' },
      defaults: {
        courseId: reactCourse.id,
        title: 'Componentes y JSX',
        description: 'Aprende a crear componentes y usar JSX',
        type: LessonType.VIDEO,
        content: 'Contenido sobre componentes y JSX...',
        videoUrl: 'https://www.youtube.com/watch?v=react2',
        duration: 960, // 16 minutos
        orderIndex: 2,
        isPreview: false
      }
    });

    console.log('✅ Lecciones creadas exitosamente');

    console.log('🎉 Seed completado exitosamente!');
    console.log(`📊 Datos creados:
    - ${await models.Category.count()} categorías
    - ${await models.Course.count()} cursos
    - ${await models.Lesson.count()} lecciones`);

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar seed
seedDatabase()
  .then(() => {
    console.log('✅ Seed completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  });
