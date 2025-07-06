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

async function checkCourseStatus() {
  try {
    await sequelize.authenticate();
    
    const [courses] = await sequelize.query('SELECT id, title, status, isPublic, categoryId FROM courses');
    console.log('📚 Estados de cursos:');
    console.table(courses);
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', (error as Error).message);
  }
}

checkCourseStatus();
