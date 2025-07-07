import { sequelize } from './src/config/database.js';
import Lesson from './src/models/Lesson.js';

async function recreateLessonsTable() {
  try {
    console.log('🔄 Recreando tabla lessons...');
    
    // Eliminar tabla existente si existe
    await sequelize.query('DROP TABLE IF EXISTS lessons');
    
    // Crear tabla con la estructura correcta
    await Lesson.sync({ force: true });
    
    console.log('✅ Tabla lessons recreada exitosamente');
    
  } catch (error) {
    console.error('❌ Error recreando tabla lessons:', error);
  } finally {
    await sequelize.close();
  }
}

recreateLessonsTable();
