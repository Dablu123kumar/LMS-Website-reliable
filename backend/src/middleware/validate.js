const { errorResponse } = require('../utils/apiResponse');

/**
 * Request body validation middleware factory.
 * Takes a validation schema object and returns middleware.
 *
 * Schema format:
 * {
 *   fieldName: {
 *     required: boolean,
 *     type: 'string' | 'number' | 'boolean' | 'email',
 *     minLength: number,
 *     maxLength: number,
 *     min: number,
 *     max: number,
 *     enum: string[],
 *     message: string (custom error)
 *   }
 * }
 */
function validate(schema) {
  return (req, res, next) => {
    const errors = [];
    const body = req.body;

    for (const [field, rules] of Object.entries(schema)) {
      const value = body[field];

      // Check required
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(rules.message || `${field} is required.`);
        continue;
      }

      // Skip optional empty fields
      if (value === undefined || value === null || value === '') {
        continue;
      }

      // Check type
      if (rules.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push(`${field} must be a valid email address.`);
        }
      } else if (rules.type === 'number') {
        if (typeof value !== 'number' && isNaN(Number(value))) {
          errors.push(`${field} must be a number.`);
          continue;
        }
      } else if (rules.type === 'boolean') {
        if (typeof value !== 'boolean') {
          errors.push(`${field} must be a boolean.`);
          continue;
        }
      } else if (rules.type === 'string') {
        if (typeof value !== 'string') {
          errors.push(`${field} must be a string.`);
          continue;
        }
      }

      // Check minLength
      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters.`);
      }

      // Check maxLength
      if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
        errors.push(`${field} must be at most ${rules.maxLength} characters.`);
      }

      // Check min (number)
      if (rules.min !== undefined && Number(value) < rules.min) {
        errors.push(`${field} must be at least ${rules.min}.`);
      }

      // Check max (number)
      if (rules.max !== undefined && Number(value) > rules.max) {
        errors.push(`${field} must be at most ${rules.max}.`);
      }

      // Check enum
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}.`);
      }
    }

    if (errors.length > 0) {
      return errorResponse(res, 'Validation failed.', 400, errors);
    }

    next();
  };
}

module.exports = { validate };
