import fs from 'fs';
import path from 'path';

const modelsDir = './src/models';

// Función para convertir camelCase a snake_case
function camelToSnake(str) {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

// Función para corregir todos los patrones problemáticos
function fixModelIndexes(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;
  
  // Patrón 1: fields: ['someId']
  content = content.replace(/fields:\s*\[\s*['"`]([a-zA-Z][a-zA-Z0-9]*Id)['"`]\s*\]/g, (match, fieldName) => {
    const snakeCaseField = camelToSnake(fieldName);
    if (fieldName !== snakeCaseField) {
      changes++;
      return match.replace(fieldName, snakeCaseField);
    }
    return match;
  });
  
  // Patrón 2: fields: ['someId', 'anotherId']
  content = content.replace(/fields:\s*\[\s*['"`]([a-zA-Z][a-zA-Z0-9]*Id)['"`]\s*,\s*['"`]([a-zA-Z][a-zA-Z0-9]*Id)['"`]\s*\]/g, (match, field1, field2) => {
    const snakeField1 = camelToSnake(field1);
    const snakeField2 = camelToSnake(field2);
    let newMatch = match;
    if (field1 !== snakeField1) {
      newMatch = newMatch.replace(field1, snakeField1);
      changes++;
    }
    if (field2 !== snakeField2) {
      newMatch = newMatch.replace(field2, snakeField2);
      changes++;
    }
    return newMatch;
  });
  
  // Patrón 3: fields: ['normalField', 'someId']
  content = content.replace(/fields:\s*\[\s*['"`]([a-zA-Z][a-zA-Z0-9_]*)['"`]\s*,\s*['"`]([a-zA-Z][a-zA-Z0-9]*Id)['"`]\s*\]/g, (match, field1, field2) => {
    const snakeField2 = camelToSnake(field2);
    if (field2 !== snakeField2 && field2.endsWith('Id')) {
      changes++;
      return match.replace(field2, snakeField2);
    }
    return match;
  });
  
  // Patrón 4: fields: ['someId', 'normalField']
  content = content.replace(/fields:\s*\[\s*['"`]([a-zA-Z][a-zA-Z0-9]*Id)['"`]\s*,\s*['"`]([a-zA-Z][a-zA-Z0-9_]*)['"`]\s*\]/g, (match, field1, field2) => {
    const snakeField1 = camelToSnake(field1);
    if (field1 !== snakeField1 && field1.endsWith('Id')) {
      changes++;
      return match.replace(field1, snakeField1);
    }
    return match;
  });
  
  // Patrón 5: otros campos camelCase que deben ser snake_case
  const camelCaseFields = ['unlockedAt', 'createdAt', 'updatedAt', 'totalPoints', 'currentLevel'];
  camelCaseFields.forEach(field => {
    const snakeField = camelToSnake(field);
    const regex = new RegExp(`fields:\\s*\\[\\s*['"\`]${field}['"\`]\\s*\\]`, 'g');
    if (content.match(regex)) {
      content = content.replace(regex, `fields: ['${snakeField}']`);
      changes++;
    }
  });

  if (changes > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Corregido: ${path.basename(filePath)} (${changes} cambios)`);
  }
}

// Obtener todos los archivos .js en el directorio de modelos
const modelFiles = fs.readdirSync(modelsDir)
  .filter(file => file.endsWith('.js') && file !== 'index.js')
  .map(file => path.join(modelsDir, file));

console.log('🔄 Corrigiendo TODOS los índices en modelos...');

modelFiles.forEach(filePath => {
  try {
    fixModelIndexes(filePath);
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
  }
});

console.log('✅ Corrección completa de modelos terminada');
