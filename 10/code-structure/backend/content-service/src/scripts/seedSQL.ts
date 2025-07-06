// Script para insertar datos de prueba usando comandos SQL directos
import { Sequelize } from 'sequelize';
import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

config();

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'studymate_dev',
  username: process.env.DB_USER || 'studymate',
  password: process.env.DB_PASSWORD || '12345',
  logging: false
});

async function seedWithSQL() {
  try {
    console.log('🌱 Iniciando seeding con SQL directo...');
    
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');
    
    // IDs para referencias
    const categoryIds = [uuidv4(), uuidv4(), uuidv4(), uuidv4(), uuidv4()];
    const courseIds = [uuidv4(), uuidv4(), uuidv4(), uuidv4(), uuidv4()];
    const instructorId = uuidv4();
    
    // Primero verificar si existe la tabla users, si no, crearla temporalmente
    console.log('👤 Verificando tabla users...');
    try {
      await sequelize.query('SELECT 1 FROM users LIMIT 1');
      console.log('✅ Tabla users existe');
    } catch (error) {
      console.log('⚠️ Tabla users no existe, creando estructura básica...');
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(36) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          role ENUM('student', 'teacher', 'admin') DEFAULT 'student',
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
    }
    
    // Insertar usuario instructor
    console.log('👨‍🏫 Insertando usuario instructor...');
    await sequelize.query(`
      INSERT IGNORE INTO users (id, email, first_name, last_name, role, is_active, created_at, updated_at) VALUES
      ('${instructorId}', 'instructor@studymate.com', 'Carlos', 'Instructor', 'teacher', 1, NOW(), NOW())
    `);
    
    // Insertar categorías
    console.log('📁 Insertando categorías...');
    await sequelize.query(`
      INSERT IGNORE INTO categories (id, name, description, slug, isActive, orderIndex, createdAt, updatedAt) VALUES
      ('${categoryIds[0]}', 'Programación', 'Cursos de desarrollo de software', 'programacion', 1, 1, NOW(), NOW()),
      ('${categoryIds[1]}', 'Diseño Gráfico', 'Cursos de diseño digital', 'diseno-grafico', 1, 2, NOW(), NOW()),
      ('${categoryIds[2]}', 'Marketing Digital', 'Estrategias de marketing online', 'marketing-digital', 1, 3, NOW(), NOW()),
      ('${categoryIds[3]}', 'Idiomas', 'Aprendizaje de idiomas extranjeros', 'idiomas', 1, 4, NOW(), NOW()),
      ('${categoryIds[4]}', 'Datos y Analytics', 'Análisis de datos y machine learning', 'datos-analytics', 1, 5, NOW(), NOW())
    `);
    
    // Insertar cursos
    console.log('📚 Insertando cursos...');
    await sequelize.query(`
      INSERT IGNORE INTO courses (id, title, description, instructorId, categoryId, status, difficultyLevel, duration, price, thumbnailUrl, requirements, learningOutcomes, tags, maxStudents, currentStudents, averageRating, totalRatings, isPublic, createdAt, updatedAt) VALUES
      ('${courseIds[0]}', 'JavaScript Moderno - De Principiante a Experto', 'Aprende JavaScript desde cero hasta conceptos avanzados. Incluye ES6+, async/await, APIs y más.', '${instructorId}', '${categoryIds[0]}', 'published', 'beginner', 2400, 89.99, '/thumbnails/javascript-course.jpg', '["Conocimientos básicos de computación", "Ganas de aprender"]', '["Dominar JavaScript ES6+", "Crear aplicaciones web interactivas"]', '["javascript", "programacion", "web-development"]', 100, 45, 4.7, 123, 1, NOW(), NOW()),
      ('${courseIds[1]}', 'React.js Completo - Hooks, Context y Redux', 'Construcción de aplicaciones web modernas con React. Desde componentes básicos hasta gestión de estado compleja.', '${instructorId}', '${categoryIds[0]}', 'published', 'intermediate', 3000, 129.99, '/thumbnails/react-course.jpg', '["JavaScript intermedio", "HTML y CSS"]', '["Crear SPAs con React", "Gestionar estado con Redux"]', '["react", "javascript", "frontend"]', 80, 67, 4.8, 89, 1, NOW(), NOW()),
      ('${courseIds[2]}', 'Python para Data Science', 'Análisis de datos con Python, Pandas, NumPy y visualización con Matplotlib y Seaborn.', '${instructorId}', '${categoryIds[4]}', 'published', 'intermediate', 2800, 99.99, '/thumbnails/python-data-science.jpg', '["Matemáticas básicas", "Lógica de programación"]', '["Analizar datos con Pandas", "Crear visualizaciones"]', '["python", "data-science", "analytics"]', 120, 89, 4.6, 156, 1, NOW(), NOW()),
      ('${courseIds[3]}', 'Diseño UI/UX con Figma', 'Aprende a crear interfaces atractivas y funcionales. Desde wireframes hasta prototipos interactivos.', '${instructorId}', '${categoryIds[1]}', 'published', 'beginner', 2200, 79.99, '/thumbnails/figma-design.jpg', '["Conocimientos básicos de diseño", "Creatividad"]', '["Dominar Figma", "Crear prototipos interactivos"]', '["figma", "ui-ux", "design"]', 60, 34, 4.5, 67, 1, NOW(), NOW()),
      ('${courseIds[4]}', 'Marketing Digital Completo 2025', 'Estrategias modernas de marketing online: SEO, SEM, redes sociales y email marketing.', '${instructorId}', '${categoryIds[2]}', 'published', 'intermediate', 2600, 109.99, '/thumbnails/marketing-digital.jpg', '["Conocimientos básicos de marketing", "Familiaridad con redes sociales"]', '["Crear campañas efectivas", "Optimizar SEO"]', '["marketing", "seo", "social-media"]', 150, 112, 4.4, 189, 1, NOW(), NOW())
    `);
    
    // Insertar lecciones
    console.log('📖 Insertando lecciones...');
    const lessonQueries: string[] = [];
    
    courseIds.forEach((courseId, courseIndex) => {
      for (let i = 0; i < 5; i++) {
        const lessonId = uuidv4();
        const lessonType = i % 2 === 0 ? 'video' : 'text';
        const videoUrl = lessonType === 'video' ? `/videos/${courseId}/lesson-${i + 1}.mp4` : 'NULL';
        
        lessonQueries.push(`
          ('${lessonId}', '${courseId}', 'Lección ${i + 1}: Introducción al Tema ${i + 1}', 'Descripción detallada de la lección ${i + 1}', '${lessonType}', 'Contenido de la lección con explicaciones detalladas y ejemplos prácticos.', ${videoUrl ? `'${videoUrl}'` : 'NULL'}, ${Math.floor(Math.random() * 30) + 15}, ${i + 1}, ${i === 0 ? 1 : 0}, NOW(), NOW())
        `);
      }
    });
    
    await sequelize.query(`
      INSERT IGNORE INTO lessons (id, courseId, title, description, type, content, videoUrl, duration, orderIndex, isPreview, createdAt, updatedAt) VALUES
      ${lessonQueries.join(',')}
    `);
    
    // Insertar materiales
    console.log('📄 Insertando materiales...');
    const materialQueries: string[] = [];
    
    courseIds.forEach((courseId) => {
      for (let i = 0; i < 3; i++) {
        const materialId = uuidv4();
        materialQueries.push(`
          ('${materialId}', '${courseId}', 'Material ${i + 1}: Recursos Adicionales', 'Material complementario para el curso', 'pdf', '/materials/${courseId}/material-${i + 1}.pdf', 'material-${i + 1}.pdf', ${Math.floor(Math.random() * 2000000) + 500000}, 'application/pdf', ${i + 1}, 1, NOW(), NOW())
        `);
      }
    });
    
    await sequelize.query(`
      INSERT IGNORE INTO materials (id, courseId, title, description, type, fileUrl, fileName, fileSize, mimeType, orderIndex, isDownloadable, createdAt, updatedAt) VALUES
      ${materialQueries.join(',')}
    `);
    
    console.log('🎉 ¡Seeding completado exitosamente!');
    console.log('📊 Resumen:');
    console.log(`   • 1 usuario instructor`);
    console.log(`   • 5 categorías`);
    console.log(`   • 5 cursos`);
    console.log(`   • 25 lecciones (5 por curso)`);
    console.log(`   • 15 materiales (3 por curso)`);
    
    // Verificar datos insertados
    const [usersResult] = await sequelize.query('SELECT COUNT(*) as count FROM users');
    const [coursesResult] = await sequelize.query('SELECT COUNT(*) as count FROM courses');
    const [lessonsResult] = await sequelize.query('SELECT COUNT(*) as count FROM lessons');
    const [materialsResult] = await sequelize.query('SELECT COUNT(*) as count FROM materials');
    
    console.log('✅ Verificación:');
    console.log(`   • Usuarios en BD: ${(usersResult[0] as any).count}`);
    console.log(`   • Cursos en BD: ${(coursesResult[0] as any).count}`);
    console.log(`   • Lecciones en BD: ${(lessonsResult[0] as any).count}`);
    console.log(`   • Materiales en BD: ${(materialsResult[0] as any).count}`);
    
  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
  } finally {
    await sequelize.close();
  }
}

export default seedWithSQL;

if (require.main === module) {
  seedWithSQL();
}
