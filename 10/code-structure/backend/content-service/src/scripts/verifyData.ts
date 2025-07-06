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

async function verifyData() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');
    
    console.log('\n=== Verificando datos insertados ===');
    
    const [courses] = await sequelize.query('SELECT id, title, instructorId, categoryId FROM courses LIMIT 5');
    console.log('📚 Cursos encontrados:', courses.length);
    if (courses.length > 0) {
      console.table(courses);
    }
    
    const [categories] = await sequelize.query('SELECT id, name, slug FROM categories LIMIT 5');
    console.log('\n📁 Categorías encontradas:', categories.length);
    if (categories.length > 0) {
      console.table(categories);
    }
    
    const [users] = await sequelize.query('SELECT id, email, role FROM users WHERE role = "teacher" LIMIT 2');
    console.log('\n👨‍🏫 Instructores encontrados:', users.length);
    if (users.length > 0) {
      console.table(users);
    }
    
    const [lessons] = await sequelize.query('SELECT COUNT(*) as count FROM lessons');
    console.log('\n📖 Total de lecciones:', (lessons[0] as any).count);
    
    const [materials] = await sequelize.query('SELECT COUNT(*) as count FROM materials');
    console.log('📄 Total de materiales:', (materials[0] as any).count);
    
  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
  } finally {
    await sequelize.close();
  }
}

verifyData();
