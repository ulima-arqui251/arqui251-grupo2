import sequelize from '../src/config/database.js';
import '../src/models/index.js';

async function resetDatabase() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente.');

    console.log('🗑️  Eliminando todas las tablas...');
    await sequelize.drop();
    console.log('✅ Tablas eliminadas.');

    console.log('🔄 Recreando tablas...');
    await sequelize.sync({ force: true });
    console.log('✅ Tablas recreadas.');

    console.log('🎉 Reset de base de datos completado!');
    console.log('💡 Ejecuta "npm run seed" para agregar datos de prueba.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el reset:', error);
    process.exit(1);
  }
}

resetDatabase();
