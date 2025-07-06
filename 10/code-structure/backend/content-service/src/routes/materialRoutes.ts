import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { MaterialController } from '../controllers/MaterialController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';
import { UserRole } from '../types/common';
import { upload } from '../middleware/uploadMiddleware';
import {
  validateCreateMaterial,
  validateUpdateMaterial
} from '../validators/materialValidators';

const router = Router();
const materialController = new MaterialController();

// Rate limiting específico para uploads
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // máximo 20 uploads por IP cada 15 min
  message: {
    success: false,
    message: 'Demasiadas cargas de archivos. Intenta de nuevo más tarde.'
  }
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.'
  }
});

router.use(generalLimiter);

/**
 * @route   GET /api/materials
 * @desc    RF-07: Obtener materiales con filtros
 * @access  Private (enrolled students)
 */
router.get('/', authenticateToken, materialController.getAllMaterials);

/**
 * @route   GET /api/materials/:id
 * @desc    RF-07: Obtener detalles de material específico
 * @access  Private (enrolled students)
 */
router.get('/:id', authenticateToken, materialController.getMaterialById);

/**
 * @route   POST /api/materials
 * @desc    RF-16: Crear nuevo material (solo instructores/admins)
 * @access  Private (Instructor/Admin)
 */
router.post('/', 
  uploadLimiter,
  authenticateToken, 
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]), 
  upload.single('file'),
  validateCreateMaterial, 
  materialController.createMaterial
);

/**
 * @route   PUT /api/materials/:id
 * @desc    RF-16: Actualizar material existente
 * @access  Private (Instructor/Admin)
 */
router.put('/:id', 
  authenticateToken, 
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]), 
  upload.single('file'),
  validateUpdateMaterial, 
  materialController.updateMaterial
);

/**
 * @route   DELETE /api/materials/:id
 * @desc    Eliminar material
 * @access  Private (Instructor/Admin)
 */
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]), 
  materialController.deleteMaterial
);

/**
 * @route   GET /api/materials/:id/download
 * @desc    RF-07: Descargar material (si es descargable)
 * @access  Private (enrolled students)
 */
router.get('/:id/download', 
  authenticateToken, 
  materialController.downloadMaterial
);

/**
 * @route   POST /api/materials/upload
 * @desc    RF-16: Subir archivo de material
 * @access  Private (Instructor/Admin)
 */
router.post('/upload', 
  uploadLimiter,
  authenticateToken, 
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]), 
  upload.single('file'),
  materialController.uploadFile
);

/**
 * @route   GET /api/materials/course/:courseId
 * @desc    RF-07: Obtener materiales de un curso específico
 * @access  Private (enrolled students)
 */
router.get('/course/:courseId', 
  authenticateToken, 
  materialController.getMaterialsByCourse
);

/**
 * @route   GET /api/materials/lesson/:lessonId
 * @desc    RF-07: Obtener materiales de una lección específica
 * @access  Private (enrolled students)
 */
router.get('/lesson/:lessonId', 
  authenticateToken, 
  materialController.getMaterialsByLesson
);

export default router;
