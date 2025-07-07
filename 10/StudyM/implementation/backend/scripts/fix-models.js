#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const modelsDir = './src/models';

// Función para corregir los tipos de ID en un archivo
function fixModelFile(filePath) {
    console.log(`Corrigiendo: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Reemplazar INTEGER primary keys con UUID
    content = content.replace(
        /(\s*)id:\s*{\s*\n(\s*)type:\s*DataTypes\.INTEGER,\s*\n(\s*)primaryKey:\s*true,\s*\n(\s*)autoIncrement:\s*true\s*\n(\s*)}/g,
        '$1id: {\n$2type: DataTypes.UUID,\n$3primaryKey: true,\n$4defaultValue: DataTypes.UUIDV4\n$5}'
    );
    
    // Reemplazar INTEGER user references con UUID
    content = content.replace(
        /(\s*)userId:\s*{\s*\n(\s*)type:\s*DataTypes\.INTEGER,\s*\n(\s*)allowNull:\s*false,\s*\n(\s*)references:\s*{\s*\n(\s*)model:\s*'users',\s*\n(\s*)key:\s*'id'\s*\n(\s*)}\s*\n(\s*)}/g,
        '$1userId: {\n$2type: DataTypes.UUID,\n$3allowNull: false,\n$4references: {\n$5model: \'users\',\n$6key: \'id\'\n$7}\n$8}'
    );
    
    // Reemplazar otros IDs que referencien tablas que ya usan UUID
    const uuidTables = ['users', 'courses', 'lessons', 'achievements', 'study_groups', 'assignments'];
    
    uuidTables.forEach(table => {
        const tableId = table.slice(0, -1) + 'Id'; // Remove 's' and add 'Id'
        const pattern = new RegExp(
            `(\\s*)${tableId}:\\s*{\\s*\\n(\\s*)type:\\s*DataTypes\\.INTEGER,\\s*\\n(\\s*)allowNull:\\s*false,\\s*\\n(\\s*)references:\\s*{\\s*\\n(\\s*)model:\\s*'${table}',\\s*\\n(\\s*)key:\\s*'id'\\s*\\n(\\s*)}\\s*\\n(\\s*)}`,
            'g'
        );
        
        content = content.replace(
            pattern,
            `$1${tableId}: {\n$2type: DataTypes.UUID,\n$3allowNull: false,\n$4references: {\n$5model: '${table}',\n$6key: 'id'\n$7}\n$8}`
        );
    });
    
    fs.writeFileSync(filePath, content);
}

// Obtener todos los archivos .js en el directorio de modelos
const files = fs.readdirSync(modelsDir)
    .filter(file => file.endsWith('.js') && file !== 'index.js')
    .map(file => path.join(modelsDir, file));

// Procesar cada archivo
files.forEach(fixModelFile);

console.log('✅ Todos los modelos han sido corregidos para usar UUID');
