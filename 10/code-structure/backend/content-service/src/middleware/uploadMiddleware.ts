import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { MaterialType } from '../types/common';

// Crear directorio de uploads si no existe
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Crear subdirectorios por tipo de material
    const materialType = getMaterialTypeFromMimeType(file.mimetype);
    const typeDir = path.join(uploadDir, materialType);
    
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true });
    }
    
    cb(null, typeDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único con timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// Función para determinar el tipo de material basado en MIME type
function getMaterialTypeFromMimeType(mimeType: string): MaterialType {
  if (mimeType.startsWith('video/')) return MaterialType.VIDEO;
  if (mimeType.startsWith('audio/')) return MaterialType.AUDIO;
  if (mimeType.startsWith('image/')) return MaterialType.IMAGE;
  if (mimeType === 'application/pdf') return MaterialType.PDF;
  if (mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('text')) {
    return MaterialType.DOCUMENT;
  }
  return MaterialType.DOCUMENT; // default
}

// Filtro de archivos
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Tipos de archivo permitidos desde .env
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/webm',
    'application/pdf',
    'text/plain'
  ];

  // Tipos adicionales para contenido educativo
  const educationalTypes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'audio/mpeg',
    'audio/wav',
    'video/avi'
  ];

  const allAllowedTypes = [...allowedTypes, ...educationalTypes];

  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Tipos permitidos: ${allAllowedTypes.join(', ')}`));
  }
};

// Configuración de multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB por defecto
    files: 1 // Un archivo por vez
  }
});

// Middleware especializado para videos (límite más alto)
const uploadVideo = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const videoTypes = process.env.ALLOWED_VIDEO_TYPES?.split(',') || [
      'video/mp4',
      'video/webm',
      'video/avi'
    ];
    
    if (videoTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de video no permitido: ${file.mimetype}. Tipos permitidos: ${videoTypes.join(', ')}`));
    }
  },
  limits: {
    fileSize: parseInt(process.env.MAX_CONTENT_SIZE || '52428800'), // 50MB para videos
    files: 1
  }
});

// Middleware especializado para documentos
const uploadDocument = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const documentTypes = process.env.ALLOWED_DOCUMENT_TYPES?.split(',') || [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (documentTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de documento no permitido: ${file.mimetype}. Tipos permitidos: ${documentTypes.join(', ')}`));
    }
  },
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB para documentos
    files: 1
  }
});

// Error handler para multer
const handleMulterError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande',
        maxSize: process.env.MAX_FILE_SIZE || '10MB'
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Demasiados archivos. Solo se permite un archivo por vez'
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Campo de archivo inesperado'
      });
    }
  }
  
  if (error.message) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

export { 
  upload, 
  uploadVideo, 
  uploadDocument, 
  handleMulterError,
  getMaterialTypeFromMimeType 
};
