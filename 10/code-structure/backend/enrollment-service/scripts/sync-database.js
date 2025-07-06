const sequelize = require('../dist/models/database').default;

async function syncDatabase() {
  try {
    console.log('🔄 Sincronizando base de datos...');
    
    // Forzar sincronización con alter: true para actualizar esquemas
    await sequelize.sync({ alter: true });
    
    console.log('✅ Base de datos sincronizada correctamente');
    
  } catch (error) {
    console.error('❌ Error al sincronizar base de datos:', error);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();
