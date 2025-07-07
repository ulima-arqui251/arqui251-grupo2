import sequelize from '../src/config/database.js';
import '../src/models/index.js'; // Importar todos los modelos

async function migrate() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente.');

    console.log('🔄 Sincronizando modelos con la base de datos...');
    
    // En desarrollo usar force: true, en producción usar alter: true
    const isProduction = process.env.NODE_ENV === 'production';
    const syncOptions = isProduction 
      ? { alter: true } // Modifica tablas existentes sin eliminar datos
      : { force: true }; // Recrea todas las tablas (desarrollo)
    
    await sequelize.sync(syncOptions);
    console.log(`✅ Modelos sincronizados correctamente (${isProduction ? 'alter' : 'force'} mode).`);

    console.log('🎉 Migración completada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    console.error('Detalles:', error.message);
    process.exit(1);
  }
}

migrate();
