/**
 * Utilidades para responses de la API
 */

/**
 * Respuesta exitosa estándar
 * @param {Object} res - Response object de Express
 * @param {*} data - Datos a enviar
 * @param {string} message - Mensaje de éxito
 * @param {number} statusCode - Código de estado HTTP (por defecto 200)
 */
export const successResponse = (res, data = null, message = 'Operación exitosa', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Respuesta de error estándar
 * @param {Object} res - Response object de Express
 * @param {string} message - Mensaje de error
 * @param {number} statusCode - Código de estado HTTP (por defecto 500)
 * @param {Array} errors - Array de errores detallados (opcional)
 */
export const errorResponse = (res, message = 'Error interno del servidor', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (errors && Array.isArray(errors)) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Respuesta de validación de datos
 * @param {Object} res - Response object de Express
 * @param {Array} errors - Array de errores de validación
 * @param {string} message - Mensaje principal (opcional)
 */
export const validationErrorResponse = (res, errors, message = 'Datos de entrada inválidos') => {
  return res.status(400).json({
    success: false,
    message,
    errors: errors,
    timestamp: new Date().toISOString()
  });
};

/**
 * Respuesta de recurso no encontrado
 * @param {Object} res - Response object de Express
 * @param {string} resource - Nombre del recurso no encontrado
 * @param {string} message - Mensaje personalizado (opcional)
 */
export const notFoundResponse = (res, resource = 'Recurso', message = null) => {
  const defaultMessage = `${resource} no encontrado`;
  return errorResponse(res, message || defaultMessage, 404);
};

/**
 * Respuesta de acceso no autorizado
 * @param {Object} res - Response object de Express
 * @param {string} message - Mensaje de error (opcional)
 */
export const unauthorizedResponse = (res, message = 'Acceso no autorizado') => {
  return errorResponse(res, message, 401);
};

/**
 * Respuesta de acceso prohibido
 * @param {Object} res - Response object de Express
 * @param {string} message - Mensaje de error (opcional)
 */
export const forbiddenResponse = (res, message = 'Acceso prohibido') => {
  return errorResponse(res, message, 403);
};

/**
 * Respuesta de conflicto (recurso ya existe)
 * @param {Object} res - Response object de Express
 * @param {string} message - Mensaje de error (opcional)
 */
export const conflictResponse = (res, message = 'El recurso ya existe') => {
  return errorResponse(res, message, 409);
};

/**
 * Respuesta de límite de tasa excedido
 * @param {Object} res - Response object de Express
 * @param {string} message - Mensaje de error (opcional)
 */
export const rateLimitResponse = (res, message = 'Demasiadas solicitudes, intenta más tarde') => {
  return errorResponse(res, message, 429);
};

/**
 * Respuesta paginada
 * @param {Object} res - Response object de Express
 * @param {Array} data - Array de datos
 * @param {Object} pagination - Información de paginación
 * @param {string} message - Mensaje de éxito (opcional)
 */
export const paginatedResponse = (res, data, pagination, message = 'Datos obtenidos exitosamente') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalItems: pagination.totalItems,
      itemsPerPage: pagination.itemsPerPage,
      hasNext: pagination.hasNext,
      hasPrev: pagination.hasPrev
    },
    timestamp: new Date().toISOString()
  });
};
