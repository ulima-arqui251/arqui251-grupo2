/**
 * Middleware de validación usando Joi
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const validationErrors = [];

    // Validar body si existe schema para body
    if (schema.body) {
      const { error } = schema.body.validate(req.body);
      if (error) {
        validationErrors.push(...error.details.map(detail => ({
          field: `body.${detail.path.join('.')}`,
          message: detail.message
        })));
      }
    }

    // Validar params si existe schema para params
    if (schema.params) {
      const { error } = schema.params.validate(req.params);
      if (error) {
        validationErrors.push(...error.details.map(detail => ({
          field: `params.${detail.path.join('.')}`,
          message: detail.message
        })));
      }
    }

    // Validar query si existe schema para query
    if (schema.query) {
      const { error } = schema.query.validate(req.query);
      if (error) {
        validationErrors.push(...error.details.map(detail => ({
          field: `query.${detail.path.join('.')}`,
          message: detail.message
        })));
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: validationErrors
      });
    }
    
    next();
  };
};
