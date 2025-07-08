import { TextAnalyticsClient, AzureKeyCredential } from '@azure/ai-text-analytics';
import { ComputerVisionClient } from '@azure/cognitiveservices-computervision';
import { CognitiveServicesCredentials } from '@azure/ms-rest-azure-js';
import axios from 'axios';

class AzureService {
  constructor() {
    this.textAnalyticsClient = null;
    this.computerVisionClient = null;
    this.translatorClient = null;
    this.initializeClients();
  }

  initializeClients() {
    try {
      // Text Analytics para análisis de sentimientos y extracción de frases clave
      if (process.env.AZURE_TEXT_ANALYTICS_KEY && process.env.AZURE_TEXT_ANALYTICS_ENDPOINT) {
        this.textAnalyticsClient = new TextAnalyticsClient(
          process.env.AZURE_TEXT_ANALYTICS_ENDPOINT,
          new AzureKeyCredential(process.env.AZURE_TEXT_ANALYTICS_KEY)
        );
      }

      // Computer Vision para procesamiento de imágenes
      if (process.env.AZURE_COMPUTER_VISION_KEY && process.env.AZURE_COMPUTER_VISION_ENDPOINT) {
        const credentials = new CognitiveServicesCredentials(process.env.AZURE_COMPUTER_VISION_KEY);
        this.computerVisionClient = new ComputerVisionClient(
          credentials,
          process.env.AZURE_COMPUTER_VISION_ENDPOINT
        );
      }

      // Translator para traducciones
      if (process.env.AZURE_TRANSLATOR_KEY && process.env.AZURE_TRANSLATOR_ENDPOINT) {
        this.translatorClient = new TranslatorTextClient(
          new CognitiveServicesCredentials(process.env.AZURE_TRANSLATOR_KEY),
          process.env.AZURE_TRANSLATOR_ENDPOINT
        );
      }
    } catch (error) {
      console.warn('Azure services initialization warning:', error.message);
    }
  }

  /**
   * Analiza el sentimiento de un texto
   * @param {string} text - Texto a analizar
   * @returns {Promise<Object>} Resultado del análisis de sentimiento
   */
  async analyzeSentiment(text) {
    if (!this.textAnalyticsClient) {
      throw new Error('Azure Text Analytics no está configurado');
    }

    try {
      const results = await this.textAnalyticsClient.analyzeSentiment([text]);
      
      if (results.length === 0 || results[0].error) {
        throw new Error('Error al analizar el sentimiento');
      }

      const result = results[0];
      return {
        sentiment: result.sentiment,
        confidence: result.confidenceScores,
        sentences: result.sentences.map(sentence => ({
          text: sentence.text,
          sentiment: sentence.sentiment,
          confidence: sentence.confidenceScores
        }))
      };
    } catch (error) {
      console.error('Error en análisis de sentimiento:', error);
      throw error;
    }
  }

  /**
   * Extrae frases clave de un texto
   * @param {string} text - Texto a analizar
   * @returns {Promise<Array>} Array de frases clave
   */
  async extractKeyPhrases(text) {
    if (!this.textAnalyticsClient) {
      throw new Error('Azure Text Analytics no está configurado');
    }

    try {
      const results = await this.textAnalyticsClient.extractKeyPhrases([text]);
      
      if (results.length === 0 || results[0].error) {
        throw new Error('Error al extraer frases clave');
      }

      return results[0].keyPhrases;
    } catch (error) {
      console.error('Error en extracción de frases clave:', error);
      throw error;
    }
  }

  /**
   * Detecta el idioma de un texto
   * @param {string} text - Texto a analizar
   * @returns {Promise<Object>} Información del idioma detectado
   */
  async detectLanguage(text) {
    if (!this.textAnalyticsClient) {
      throw new Error('Azure Text Analytics no está configurado');
    }

    try {
      const results = await this.textAnalyticsClient.detectLanguage([text]);
      
      if (results.length === 0 || results[0].error) {
        throw new Error('Error al detectar idioma');
      }

      const result = results[0];
      return {
        language: result.primaryLanguage.iso6391Name,
        name: result.primaryLanguage.name,
        confidence: result.primaryLanguage.confidenceScore
      };
    } catch (error) {
      console.error('Error en detección de idioma:', error);
      throw error;
    }
  }

  /**
   * Analiza una imagen y extrae información
   * @param {string} imageUrl - URL de la imagen o buffer
   * @returns {Promise<Object>} Información extraída de la imagen
   */
  async analyzeImage(imageUrl) {
    if (!this.computerVisionClient) {
      throw new Error('Azure Computer Vision no está configurado');
    }

    try {
      const features = ['Description', 'Tags', 'Objects', 'Faces', 'Categories'];
      const result = await this.computerVisionClient.analyzeImage(imageUrl, { visualFeatures: features });

      return {
        description: result.description ? {
          captions: result.description.captions.map(cap => ({
            text: cap.text,
            confidence: cap.confidence
          })),
          tags: result.description.tags
        } : null,
        tags: result.tags ? result.tags.map(tag => ({
          name: tag.name,
          confidence: tag.confidence
        })) : [],
        objects: result.objects ? result.objects.map(obj => ({
          object: obj.object,
          confidence: obj.confidence,
          rectangle: obj.rectangle
        })) : [],
        faces: result.faces ? result.faces.map(face => ({
          age: face.age,
          gender: face.gender,
          faceRectangle: face.faceRectangle
        })) : [],
        categories: result.categories ? result.categories.map(cat => ({
          name: cat.name,
          score: cat.score
        })) : []
      };
    } catch (error) {
      console.error('Error en análisis de imagen:', error);
      throw error;
    }
  }

  /**
   * Extrae texto de una imagen (OCR)
   * @param {string} imageUrl - URL de la imagen
   * @returns {Promise<string>} Texto extraído
   */
  async extractTextFromImage(imageUrl) {
    if (!this.computerVisionClient) {
      throw new Error('Azure Computer Vision no está configurado');
    }

    try {
      const result = await this.computerVisionClient.recognizeText(imageUrl, { mode: 'Printed' });
      
      // Extraer el texto de las líneas
      let extractedText = '';
      if (result.recognitionResult && result.recognitionResult.lines) {
        extractedText = result.recognitionResult.lines
          .map(line => line.text)
          .join(' ');
      }

      return extractedText;
    } catch (error) {
      console.error('Error en extracción de texto:', error);
      throw error;
    }
  }

  /**
   * Traduce texto a otro idioma
   * @param {string} text - Texto a traducir
   * @param {string} targetLanguage - Idioma objetivo (código ISO)
   * @param {string} sourceLanguage - Idioma origen (opcional)
   * @returns {Promise<Object>} Texto traducido
   */
  async translateText(text, targetLanguage, sourceLanguage = null) {
    if (!process.env.AZURE_TRANSLATOR_KEY) {
      throw new Error('Azure Translator no está configurado');
    }

    try {
      const response = await axios.post(
        `${process.env.AZURE_TRANSLATOR_ENDPOINT}/translate`,
        [{
          text: text
        }],
        {
          headers: {
            'Ocp-Apim-Subscription-Key': process.env.AZURE_TRANSLATOR_KEY,
            'Content-Type': 'application/json'
          },
          params: {
            'api-version': '3.0',
            'to': targetLanguage,
            ...(sourceLanguage && { from: sourceLanguage })
          }
        }
      );

      if (response.data && response.data.length > 0) {
        const translation = response.data[0];
        return {
          originalText: text,
          translatedText: translation.translations[0].text,
          targetLanguage: targetLanguage,
          detectedLanguage: translation.detectedLanguage
        };
      }

      throw new Error('No se pudo traducir el texto');
    } catch (error) {
      console.error('Error en traducción:', error);
      throw error;
    }
  }

  /**
   * Genera resumen de texto usando Azure
   * @param {string} text - Texto a resumir
   * @returns {Promise<Object>} Resumen del texto
   */
  async summarizeText(text) {
    if (!this.textAnalyticsClient) {
      throw new Error('Azure Text Analytics no está configurado');
    }

    try {
      // Combinar análisis de sentimiento y frases clave para generar resumen
      const [sentiment, keyPhrases] = await Promise.all([
        this.analyzeSentiment(text),
        this.extractKeyPhrases(text)
      ]);

      // Generar resumen basado en las frases clave más importantes
      const summary = keyPhrases.slice(0, 5).join(', ');
      
      return {
        summary: summary,
        keyPhrases: keyPhrases,
        sentiment: sentiment.sentiment,
        confidence: sentiment.confidence.positive
      };
    } catch (error) {
      console.error('Error en resumen de texto:', error);
      throw error;
    }
  }

  /**
   * Procesa contenido educativo y extrae información relevante
   * @param {string} content - Contenido educativo
   * @returns {Promise<Object>} Información procesada
   */
  async processEducationalContent(content) {
    try {
      const [language, keyPhrases, sentiment] = await Promise.all([
        this.detectLanguage(content),
        this.extractKeyPhrases(content),
        this.analyzeSentiment(content)
      ]);

      // Filtrar frases clave educativas
      const educationalKeywords = keyPhrases.filter(phrase => 
        phrase.length > 3 && 
        !['que', 'para', 'con', 'una', 'por', 'del', 'las', 'los', 'más'].includes(phrase.toLowerCase())
      );

      return {
        language: language,
        keyPhrases: educationalKeywords,
        sentiment: sentiment,
        difficulty: this.assessDifficulty(content, educationalKeywords),
        topics: this.extractTopics(educationalKeywords),
        readabilityScore: this.calculateReadabilityScore(content)
      };
    } catch (error) {
      console.error('Error en procesamiento de contenido educativo:', error);
      throw error;
    }
  }

  /**
   * Evalúa la dificultad del contenido
   * @param {string} content - Contenido a evaluar
   * @param {Array} keyPhrases - Frases clave
   * @returns {string} Nivel de dificultad
   */
  assessDifficulty(content, keyPhrases) {
    const words = content.split(/\s+/);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const complexWords = keyPhrases.filter(phrase => phrase.length > 10).length;
    
    if (avgWordLength > 7 || complexWords > 5) {
      return 'avanzado';
    } else if (avgWordLength > 5 || complexWords > 2) {
      return 'intermedio';
    } else {
      return 'principiante';
    }
  }

  /**
   * Extrae temas principales del contenido
   * @param {Array} keyPhrases - Frases clave
   * @returns {Array} Temas identificados
   */
  extractTopics(keyPhrases) {
    const topics = [];
    const educationalTopics = {
      'matemáticas': ['números', 'suma', 'resta', 'multiplicación', 'división', 'álgebra', 'geometría'],
      'ciencias': ['experimento', 'célula', 'átomo', 'molécula', 'energía', 'fuerza', 'gravedad'],
      'lenguaje': ['gramática', 'sintaxis', 'literatura', 'escritura', 'lectura', 'verbo', 'sustantivo'],
      'historia': ['guerra', 'civilización', 'cultura', 'época', 'siglo', 'revolución', 'imperio'],
      'tecnología': ['computadora', 'internet', 'programación', 'software', 'hardware', 'datos']
    };

    for (const [topic, keywords] of Object.entries(educationalTopics)) {
      const matches = keyPhrases.filter(phrase => 
        keywords.some(keyword => phrase.toLowerCase().includes(keyword))
      );
      
      if (matches.length > 0) {
        topics.push({
          topic: topic,
          relevance: matches.length,
          keywords: matches
        });
      }
    }

    return topics.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Calcula un score de legibilidad básico
   * @param {string} content - Contenido a evaluar
   * @returns {number} Score de legibilidad (0-100)
   */
  calculateReadabilityScore(content) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/);
    const avgWordsPerSentence = words.length / sentences.length;
    const avgCharsPerWord = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    // Fórmula simplificada basada en longitud de oraciones y palabras
    const score = Math.max(0, Math.min(100, 
      100 - (avgWordsPerSentence * 2) - (avgCharsPerWord * 5)
    ));
    
    return Math.round(score);
  }

  /**
   * Verifica si los servicios de Azure están disponibles
   * @returns {Object} Estado de los servicios
   */
  getServicesStatus() {
    return {
      textAnalytics: !!this.textAnalyticsClient,
      computerVision: !!this.computerVisionClient,
      translator: !!process.env.AZURE_TRANSLATOR_KEY,
      configured: !!(
        process.env.AZURE_TEXT_ANALYTICS_KEY &&
        process.env.AZURE_COMPUTER_VISION_KEY &&
        process.env.AZURE_TRANSLATOR_KEY
      )
    };
  }
}

export default new AzureService();
