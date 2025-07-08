import azureService from './azure.service.js';
import { successResponse, errorResponse } from '../../utils/responses.js';

class AzureController {
  /**
   * Analiza el sentimiento de un texto
   */
  async analyzeSentiment(req, res) {
    try {
      const { text } = req.body;
      
      const result = await azureService.analyzeSentiment(text);
      
      return successResponse(res, result, 'Análisis de sentimiento completado');
    } catch (error) {
      console.error('Error en análisis de sentimiento:', error);
      return errorResponse(res, 'Error al analizar el sentimiento', 500);
    }
  }

  /**
   * Extrae frases clave de un texto
   */
  async extractKeyPhrases(req, res) {
    try {
      const { text } = req.body;
      
      const keyPhrases = await azureService.extractKeyPhrases(text);
      
      return successResponse(res, { keyPhrases }, 'Frases clave extraídas exitosamente');
    } catch (error) {
      console.error('Error en extracción de frases clave:', error);
      return errorResponse(res, 'Error al extraer frases clave', 500);
    }
  }

  /**
   * Detecta el idioma de un texto
   */
  async detectLanguage(req, res) {
    try {
      const { text } = req.body;
      
      const result = await azureService.detectLanguage(text);
      
      return successResponse(res, result, 'Idioma detectado exitosamente');
    } catch (error) {
      console.error('Error en detección de idioma:', error);
      return errorResponse(res, 'Error al detectar el idioma', 500);
    }
  }

  /**
   * Analiza una imagen
   */
  async analyzeImage(req, res) {
    try {
      const { imageUrl } = req.body;
      
      const result = await azureService.analyzeImage(imageUrl);
      
      return successResponse(res, result, 'Imagen analizada exitosamente');
    } catch (error) {
      console.error('Error en análisis de imagen:', error);
      return errorResponse(res, 'Error al analizar la imagen', 500);
    }
  }

  /**
   * Extrae texto de una imagen (OCR)
   */
  async extractTextFromImage(req, res) {
    try {
      const { imageUrl } = req.body;
      
      const extractedText = await azureService.extractTextFromImage(imageUrl);
      
      return successResponse(res, { extractedText }, 'Texto extraído exitosamente');
    } catch (error) {
      console.error('Error en extracción de texto:', error);
      return errorResponse(res, 'Error al extraer texto de la imagen', 500);
    }
  }

  /**
   * Traduce texto
   */
  async translateText(req, res) {
    try {
      const { text, targetLanguage, sourceLanguage } = req.body;
      
      const result = await azureService.translateText(text, targetLanguage, sourceLanguage);
      
      return successResponse(res, result, 'Texto traducido exitosamente');
    } catch (error) {
      console.error('Error en traducción:', error);
      return errorResponse(res, 'Error al traducir el texto', 500);
    }
  }

  /**
   * Genera resumen de texto
   */
  async summarizeText(req, res) {
    try {
      const { text } = req.body;
      
      const result = await azureService.summarizeText(text);
      
      return successResponse(res, result, 'Resumen generado exitosamente');
    } catch (error) {
      console.error('Error en resumen:', error);
      return errorResponse(res, 'Error al generar el resumen', 500);
    }
  }

  /**
   * Procesa contenido educativo
   */
  async processEducationalContent(req, res) {
    try {
      const { content } = req.body;
      
      const result = await azureService.processEducationalContent(content);
      
      return successResponse(res, result, 'Contenido educativo procesado exitosamente');
    } catch (error) {
      console.error('Error en procesamiento de contenido educativo:', error);
      return errorResponse(res, 'Error al procesar el contenido educativo', 500);
    }
  }

  /**
   * Obtiene el estado de los servicios de Azure
   */
  async getServicesStatus(req, res) {
    try {
      const status = azureService.getServicesStatus();
      
      return successResponse(res, status, 'Estado de servicios obtenido');
    } catch (error) {
      console.error('Error al obtener estado de servicios:', error);
      return errorResponse(res, 'Error al obtener el estado de los servicios', 500);
    }
  }

  /**
   * Procesa y analiza el contenido de una lección
   */
  async analyzeLessonContent(req, res) {
    try {
      const { content, type } = req.body; // type: 'text' | 'image'
      
      let result = {};

      if (type === 'text') {
        // Análisis completo para contenido de texto
        const [educationalAnalysis, sentiment, keyPhrases] = await Promise.all([
          azureService.processEducationalContent(content),
          azureService.analyzeSentiment(content),
          azureService.extractKeyPhrases(content)
        ]);

        result = {
          type: 'text',
          analysis: educationalAnalysis,
          sentiment: sentiment,
          keyPhrases: keyPhrases,
          recommendations: this.generateContentRecommendations(educationalAnalysis)
        };
      } else if (type === 'image') {
        // Análisis de imagen
        const [imageAnalysis, extractedText] = await Promise.all([
          azureService.analyzeImage(content),
          azureService.extractTextFromImage(content).catch(() => '')
        ]);

        result = {
          type: 'image',
          imageAnalysis: imageAnalysis,
          extractedText: extractedText,
          hasText: extractedText.length > 0
        };

        // Si hay texto extraído, analizarlo también
        if (extractedText) {
          const textAnalysis = await azureService.processEducationalContent(extractedText);
          result.textAnalysis = textAnalysis;
        }
      }

      return successResponse(res, result, 'Contenido de lección analizado exitosamente');
    } catch (error) {
      console.error('Error en análisis de contenido de lección:', error);
      return errorResponse(res, 'Error al analizar el contenido de la lección', 500);
    }
  }

  /**
   * Genera recomendaciones basadas en el análisis de contenido
   */
  generateContentRecommendations(analysis) {
    const recommendations = [];

    // Recomendaciones basadas en dificultad
    if (analysis.difficulty === 'avanzado') {
      recommendations.push({
        type: 'difficulty',
        message: 'Considera agregar ejemplos más simples para facilitar la comprensión',
        priority: 'high'
      });
    } else if (analysis.difficulty === 'principiante') {
      recommendations.push({
        type: 'difficulty',
        message: 'Podrías añadir contenido más desafiante para estudiantes avanzados',
        priority: 'medium'
      });
    }

    // Recomendaciones basadas en legibilidad
    if (analysis.readabilityScore < 50) {
      recommendations.push({
        type: 'readability',
        message: 'El contenido podría ser más fácil de leer con oraciones más cortas',
        priority: 'high'
      });
    } else if (analysis.readabilityScore > 90) {
      recommendations.push({
        type: 'readability',
        message: 'Excelente legibilidad del contenido',
        priority: 'low'
      });
    }

    // Recomendaciones basadas en sentimiento
    if (analysis.sentiment && analysis.sentiment.sentiment === 'negative') {
      recommendations.push({
        type: 'sentiment',
        message: 'Considera usar un tono más positivo y motivador',
        priority: 'medium'
      });
    }

    // Recomendaciones basadas en temas
    if (analysis.topics && analysis.topics.length === 0) {
      recommendations.push({
        type: 'topics',
        message: 'Agrega más palabras clave específicas del tema',
        priority: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * Compara dos contenidos educativos
   */
  async compareEducationalContent(req, res) {
    try {
      const { content1, content2 } = req.body;
      
      const [analysis1, analysis2] = await Promise.all([
        azureService.processEducationalContent(content1),
        azureService.processEducationalContent(content2)
      ]);

      const comparison = {
        content1: analysis1,
        content2: analysis2,
        differences: {
          difficulty: analysis1.difficulty !== analysis2.difficulty,
          language: analysis1.language.language !== analysis2.language.language,
          readabilityDifference: Math.abs(analysis1.readabilityScore - analysis2.readabilityScore),
          topicOverlap: this.calculateTopicOverlap(analysis1.topics, analysis2.topics)
        },
        recommendations: this.generateComparisonRecommendations(analysis1, analysis2)
      };

      return successResponse(res, comparison, 'Comparación de contenidos completada');
    } catch (error) {
      console.error('Error en comparación de contenidos:', error);
      return errorResponse(res, 'Error al comparar los contenidos', 500);
    }
  }

  /**
   * Calcula la superposición de temas entre dos análisis
   */
  calculateTopicOverlap(topics1, topics2) {
    if (!topics1 || !topics2 || topics1.length === 0 || topics2.length === 0) {
      return 0;
    }

    const topicNames1 = topics1.map(t => t.topic);
    const topicNames2 = topics2.map(t => t.topic);
    const intersection = topicNames1.filter(topic => topicNames2.includes(topic));
    
    return (intersection.length / Math.max(topicNames1.length, topicNames2.length)) * 100;
  }

  /**
   * Genera recomendaciones para la comparación de contenidos
   */
  generateComparisonRecommendations(analysis1, analysis2) {
    const recommendations = [];

    // Diferencias de dificultad
    if (analysis1.difficulty !== analysis2.difficulty) {
      recommendations.push({
        type: 'difficulty',
        message: `Los contenidos tienen diferentes niveles de dificultad: ${analysis1.difficulty} vs ${analysis2.difficulty}`,
        suggestion: 'Considera normalizar la dificultad o crear una progresión lógica'
      });
    }

    // Diferencias de legibilidad
    const readabilityDiff = Math.abs(analysis1.readabilityScore - analysis2.readabilityScore);
    if (readabilityDiff > 20) {
      recommendations.push({
        type: 'readability',
        message: `Gran diferencia en legibilidad (${readabilityDiff} puntos)`,
        suggestion: 'Ajusta el estilo de escritura para mantener consistencia'
      });
    }

    // Superposición de temas
    const topicOverlap = this.calculateTopicOverlap(analysis1.topics, analysis2.topics);
    if (topicOverlap < 30) {
      recommendations.push({
        type: 'topics',
        message: `Baja superposición de temas (${topicOverlap.toFixed(1)}%)`,
        suggestion: 'Considera agregar conexiones temáticas entre los contenidos'
      });
    }

    return recommendations;
  }
}

export default new AzureController();
