import express from 'express';
import azureController from './azure.controller.js';
import azureValidation from './azure.validation.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validation.js';

const router = express.Router();

// Middleware para verificar autenticación en todas las rutas
router.use(authenticate);

/**
 * @route POST /api/azure/sentiment
 * @desc Analiza el sentimiento de un texto
 * @access Private
 */
router.post('/sentiment', 
  validate(azureValidation.analyzeSentiment),
  azureController.analyzeSentiment
);

/**
 * @route POST /api/azure/key-phrases
 * @desc Extrae frases clave de un texto
 * @access Private
 */
router.post('/key-phrases', 
  validate(azureValidation.extractKeyPhrases),
  azureController.extractKeyPhrases
);

/**
 * @route POST /api/azure/detect-language
 * @desc Detecta el idioma de un texto
 * @access Private
 */
router.post('/detect-language', 
  validate(azureValidation.detectLanguage),
  azureController.detectLanguage
);

/**
 * @route POST /api/azure/analyze-image
 * @desc Analiza una imagen
 * @access Private
 */
router.post('/analyze-image', 
  validate(azureValidation.analyzeImage),
  azureController.analyzeImage
);

/**
 * @route POST /api/azure/extract-text
 * @desc Extrae texto de una imagen (OCR)
 * @access Private
 */
router.post('/extract-text', 
  validate(azureValidation.extractTextFromImage),
  azureController.extractTextFromImage
);

/**
 * @route POST /api/azure/translate
 * @desc Traduce texto a otro idioma
 * @access Private
 */
router.post('/translate', 
  validate(azureValidation.translateText),
  azureController.translateText
);

/**
 * @route POST /api/azure/summarize
 * @desc Genera resumen de un texto
 * @access Private
 */
router.post('/summarize', 
  validate(azureValidation.summarizeText),
  azureController.summarizeText
);

/**
 * @route POST /api/azure/process-educational
 * @desc Procesa contenido educativo y extrae información relevante
 * @access Private
 */
router.post('/process-educational', 
  validate(azureValidation.processEducationalContent),
  azureController.processEducationalContent
);

/**
 * @route POST /api/azure/analyze-lesson
 * @desc Analiza el contenido de una lección
 * @access Private
 */
router.post('/analyze-lesson', 
  validate(azureValidation.analyzeLessonContent),
  azureController.analyzeLessonContent
);

/**
 * @route POST /api/azure/compare-content
 * @desc Compara dos contenidos educativos
 * @access Private
 */
router.post('/compare-content', 
  validate(azureValidation.compareEducationalContent),
  azureController.compareEducationalContent
);

/**
 * @route GET /api/azure/status
 * @desc Obtiene el estado de los servicios de Azure
 * @access Private
 */
router.get('/status', azureController.getServicesStatus);

export default router;
