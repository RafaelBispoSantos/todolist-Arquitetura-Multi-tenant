// src/middleware/auth.js

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const config = require('../config/environment');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

const prisma = new PrismaClient();

/**
 * Middleware de autenticação JWT
 * Verifica se o token JWT é válido e pertence ao tenant correto
 * 
 * @param {Request} req - Objeto de requisição Express
 * @param {Response} res - Objeto de resposta Express
 * @param {NextFunction} next - Função para continuar o fluxo
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Obtém o token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }
    
    // Extrai o token removendo 'Bearer '
    const token = authHeader.split(' ')[1];
    
    // Verifica e decodifica o token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Busca o usuário no banco de dados
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
      },
    });
    
    if (!user) {
      throw new UnauthorizedError('User not found or inactive');
    }
    
    // Verifica se o usuário pertence ao tenant correto (caso não seja domínio principal)
    if (!req.isMainDomain && user.tenantId !== req.tenantId) {
      throw new ForbiddenError('User does not belong to this tenant');
    }
    
    // Anexa as informações do usuário à requisição
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'The provided token is invalid',
      });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'Token expired',
        message: 'The provided token has expired',
      });
    }
    
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      return res.status(error instanceof UnauthorizedError ? 401 : 403).json({
        error: error.name,
        message: error.message,
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Authentication failed',
    });
  }
};

/**
 * Middleware para verificar se o usuário possui uma role específica
 * 
 * @param {string[]} roles - Array de roles permitidas
 * @returns {Function} Middleware function
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
    }
    
    next();
  };
};

/**
 * Middleware opcional de autenticação
 * Tenta autenticar o usuário, mas não bloqueia se falhar
 * Útil para rotas que podem ser acessadas tanto autenticado quanto não
 * 
 * @param {Request} req - Objeto de requisição Express
 * @param {Response} res - Objeto de resposta Express
 * @param {NextFunction} next - Função para continuar o fluxo
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continua sem autenticação
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);
    
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
      },
    });
    
    if (user) {
      req.user = user;
      req.userId = user.id;
    }
    
    next();
  } catch (error) {
    // Em caso de erro na autenticação opcional, apenas continua sem usuário
    next();
  }
};

module.exports = {
  authMiddleware,
  requireRole,
  optionalAuth,
};