import { Sequelize } from 'sequelize';
import { config } from 'dotenv';

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

async function updateCourses() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');
    
    // Obtener IDs de categorías
    const [categories] = await sequelize.query('SELECT id, name FROM categories LIMIT 5');
    console.log('📁 Categorías disponibles:');
    console.table(categories);
    
    // Actualizar todos los cursos para que estén published
    console.log('\n📚 Actualizando estado de cursos a published...');
    await sequelize.query(`UPDATE courses SET status = 'published' WHERE status = 'draft'`);
    
    // Asignar categorías a los cursos (distribuir aleatoriamente)
    console.log('🔗 Asignando categorías a los cursos...');
    const [courses] = await sequelize.query('SELECT id, title FROM courses');
    
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i] as any;
      const category = categories[i % categories.length] as any;
      
      await sequelize.query(
        `UPDATE courses SET categoryId = '${category.id}' WHERE id = '${course.id}'`
      );
      
      console.log(`  ✓ Curso "${course.title}" → Categoría "${category.name}"`);
    }
    
    // Verificar resultados
    console.log('\n✅ Verificando cambios...');
    const [updatedCourses] = await sequelize.query(
      'SELECT id, title, status, isPublic, categoryId FROM courses'
    );
    console.table(updatedCourses);
    
    console.log('\n🎉 ¡Cursos actualizados exitosamente!');
    
  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
  } finally {
    await sequelize.close();
  }
}

updateCourses();
