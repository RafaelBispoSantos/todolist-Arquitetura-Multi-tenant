// src/middleware/validation.js

const { ValidationError } = require('../utils/errors');
const validators = require('../utils/validators');

/**
 * Middleware para validação de dados de requisição
 * Usa funções de validação customizadas para diferentes cenários
 */

/**
 * Valida o corpo da requisição para criação de todo
 */
const validateTodoCreate = (req, res, next) => {
  try {
    const { title, description, priority, dueDate } = req.body;
    
    if (!validators.isValidTitle(title)) {
      throw new ValidationError('Invalid title format');
    }
    
    if (description && !validators.isValidDescription(description)) {
      throw new ValidationError('Invalid description format');
    }
    
    if (priority && !validators.isValidPriority(priority)) {
      throw new ValidationError('Invalid priority value');
    }
    
    if (dueDate && !validators.isValidDate(dueDate)) {
      throw new ValidationError('Invalid due date format');
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Valida o corpo da requisição para atualização de todo
 */
const validateTodoUpdate = (req, res, next) => {
  try {
    const { title, description, priority, dueDate, status } = req.body;
    
    if (title !== undefined && !validators.isValidTitle(title)) {
      throw new ValidationError('Invalid title format');
    }
    
    if (description !== undefined && !validators.isValidDescription(description)) {
      throw new ValidationError('Invalid description format');
    }
    
    if (priority !== undefined && !validators.isValidPriority(priority)) {
      throw new ValidationError('Invalid priority value');
    }
    
    if (dueDate !== undefined && !validators.isValidDate(dueDate)) {
      throw new ValidationError('Invalid due date format');
    }
    
    if (status !== undefined && !validators.isValidStatus(status)) {
      throw new ValidationError('Invalid status value');
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Valida os dados de registro de usuário
 */
const validateUserRegistration = (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    
    if (!validators.isValidEmail(email)) {
      throw new ValidationError('Invalid email format');
    }
    
    if (!validators.isValidPassword(password)) {
      throw new ValidationError('Password must be at least 8 characters long and contain at least one number and one special character');
    }
    
    if (!validators.isValidName(name)) {
      throw new ValidationError('Invalid name format');
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Valida os dados de login
 */
const validateUserLogin = (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }
    
    if (!validators.isValidEmail(email)) {
      throw new ValidationError('Invalid email format');
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Valida os dados de criação de tenant
 */
const validateTenantCreate = (req, res, next) => {
  try {
    const { name, subdomain, primaryColor } = req.body;
    
    if (!validators.isValidTenantName(name)) {
      throw new ValidationError('Invalid tenant name');
    }
    
    if (!validators.isValidSubdomain(subdomain)) {
      throw new ValidationError('Invalid subdomain. Only lowercase letters, numbers, and hyphens are allowed');
    }
    
    if (primaryColor && !validators.isValidHexColor(primaryColor)) {
      throw new ValidationError('Invalid color format. Please use hex format (e.g., #3b82f6)');
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Valida um UUID
 */
const validateUUID = (paramName) => {
  return (req, res, next) => {
    try {
      const id = req.params[paramName];
      
      if (!validators.isValidUUID(id)) {
        throw new ValidationError(`Invalid ${paramName} format`);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Valida parâmetros de paginação
 */
const validatePagination = (req, res, next) => {
  try {
    const { page, pageSize } = req.query;
    
    if (page && (!Number.isInteger(+page) || +page < 1)) {
      throw new ValidationError('Invalid page number');
    }
    
    if (pageSize && (!Number.isInteger(+pageSize) || +pageSize < 1 || +pageSize > 100)) {
      throw new ValidationError('Invalid page size. Must be between 1 and 100');
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateTodoCreate,
  validateTodoUpdate,
  validateUserRegistration,
  validateUserLogin,
  validateTenantCreate,
  validateUUID,
  validatePagination,
};