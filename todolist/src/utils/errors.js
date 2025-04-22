// src/utils/errors.js

/**
 * Classe base para erros personalizados
 * Estende a classe Error nativa
 */
class BaseError extends Error {
    constructor(message, statusCode = 500) {
      super(message);
      this.name = this.constructor.name;
      this.statusCode = statusCode;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  /**
   * Erro de validação
   * Usado quando os dados fornecidos não passam na validação
   */
  class ValidationError extends BaseError {
    constructor(message) {
      super(message, 400);
    }
  }
  
  /**
   * Erro de não encontrado
   * Usado quando um recurso solicitado não existe
   */
  class NotFoundError extends BaseError {
    constructor(message) {
      super(message, 404);
    }
  }
  
  /**
   * Erro de não autorizado
   * Usado quando o usuário não está autenticado
   */
  class UnauthorizedError extends BaseError {
    constructor(message) {
      super(message, 401);
    }
  }
  
  /**
   * Erro de proibido
   * Usado quando o usuário não tem permissão para acessar um recurso
   */
  class ForbiddenError extends BaseError {
    constructor(message) {
      super(message, 403);
    }
  }
  
  /**
   * Erro de conflito
   * Usado quando há um conflito de dados (ex: email já existe)
   */
  class ConflictError extends BaseError {
    constructor(message) {
      super(message, 409);
    }
  }
  
  /**
   * Erro de tenant não encontrado
   * Usado quando um tenant/subdomínio não é encontrado
   */
  class TenantNotFoundError extends NotFoundError {
    constructor(message) {
      super(message);
    }
  }
  
  /**
   * Erro de taxa de requisição excedida
   * Usado quando o limite de requisições é excedido
   */
  class RateLimitError extends BaseError {
    constructor(message) {
      super(message, 429);
    }
  }
  
  /**
   * Erro de serviço indisponível
   * Usado quando um serviço externo está indisponível
   */
  class ServiceUnavailableError extends BaseError {
    constructor(message) {
      super(message, 503);
    }
  }
  
  /**
   * Erro de requisição inválida
   * Usado quando a requisição está mal formatada
   */
  class BadRequestError extends BaseError {
    constructor(message) {
      super(message, 400);
    }
  }
  
  /**
   * Middleware de tratamento global de erros
   * Deve ser registrado como último middleware na aplicação
   */
  const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    
    // Se for um erro personalizado, usa o status code definido
    if (err instanceof BaseError) {
      return res.status(err.statusCode).json({
        error: err.name,
        message: err.message,
      });
    }
    
    // Erros do Prisma
    if (err.name === 'PrismaClientKnownRequestError') {
      // Violação de chave única
      if (err.code === 'P2002') {
        return res.status(409).json({
          error: 'ConflictError',
          message: 'Record with unique constraint already exists',
        });
      }
      
      // Registro não encontrado
      if (err.code === 'P2025') {
        return res.status(404).json({
          error: 'NotFoundError',
          message: 'Record not found',
        });
      }
    }
    
    // Erros de validação do Express
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'ValidationError',
        message: err.message,
      });
    }
    
    // Erro genérico
    res.status(500).json({
      error: 'InternalServerError',
      message: 'An unexpected error occurred',
    });
  };
  
  module.exports = {
    BaseError,
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
    ConflictError,
    TenantNotFoundError,
    RateLimitError,
    ServiceUnavailableError,
    BadRequestError,
    errorHandler,
  };