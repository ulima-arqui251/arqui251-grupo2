import fs from 'fs';
import path from 'path';

const modelsDir = './src/models';

// Función para convertir camelCase a snake_case
function camelToSnake(str) {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

// Función para corregir índices en archivos de modelos
function fixModelIndexes(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Buscar y reemplazar campos en índices
  const fixedContent = content.replace(
    /fields:\s*\[\s*['"`]([a-zA-Z][a-zA-Z0-9]*Id)['"`]/g,
    (match, fieldName) => {
      const snakeCaseField = camelToSnake(fieldName);
      return match.replace(fieldName, snakeCaseField);
    }
  ).replace(
    /fields:\s*\[\s*['"`]([a-zA-Z][a-zA-Z0-9]*Id)['"`]\s*,\s*['"`]([a-zA-Z][a-zA-Z0-9]*Id)['"`]/g,
    (match, field1, field2) => {
      const snakeField1 = camelToSnake(field1);
      const snakeField2 = camelToSnake(field2);
      return match.replace(field1, snakeField1).replace(field2, snakeField2);
    }
  );

  if (content !== fixedContent) {
    fs.writeFileSync(filePath, fixedContent);
    console.log(`✅ Corregido: ${path.basename(filePath)}`);
  }
}

// Obtener todos los archivos .js en el directorio de modelos
const modelFiles = fs.readdirSync(modelsDir)
  .filter(file => file.endsWith('.js') && file !== 'index.js')
  .map(file => path.join(modelsDir, file));

console.log('🔄 Corrigiendo índices en modelos...');

modelFiles.forEach(filePath => {
  try {
    fixModelIndexes(filePath);
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
  }
});

console.log('✅ Corrección de modelos completada');
