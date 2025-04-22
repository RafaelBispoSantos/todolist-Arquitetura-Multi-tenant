// src/controllers/authController.js

const authService = require('../services/authService');
const { ValidationError, UnauthorizedError, ConflictError } = require('../utils/errors');

/**
 * Controller de Autenticação
 * Gerencia requisições relacionadas a autenticação de usuários
 */
class AuthController {
  /**
   * Registra um novo usuário
   * POST /api/auth/register
   */
  async register(req, res) {
    try {
      const { email, password, name } = req.body;
      const tenantId = req.tenantId;
      
      const { user, token } = await authService.registerUser({
        email,
        password,
        name,
      }, tenantId);
      
      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  /**
   * Realiza login de usuário
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const tenantId = req.tenantId;
      
      const { user, token } = await authService.loginUser(email, password, tenantId);
      
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  /**
   * Realiza logout de usuário
   * POST /api/auth/logout
   */
  async logout(req, res) {
    try {
      // Em uma implementação mais robusta, poderíamos invalidar o token
      // adicionando-o a uma blacklist ou usando refresh tokens
      
      res.json({
        message: 'Logout successful',
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  /**
   * Verifica se o token é válido
   * GET /api/auth/verify
   */
  async verifyToken(req, res) {
    try {
      // O middleware de autenticação já validou o token
      res.json({
        message: 'Token is valid',
        user: {
          id: req.user.id,
          email: req.user.email,
          name: req.user.name,
          role: req.user.role,
        },
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  /**
   * Obtém informações do usuário atual
   * GET /api/auth/me
   */
  async getCurrentUser(req, res) {
    try {
      const userId = req.userId;
      const tenantId = req.tenantId;
      
      const user = await authService.getUserProfile(userId, tenantId);
      
      res.json({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  /**
   * Renova o token de acesso
   * POST /api/auth/refresh-token
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        throw new ValidationError('Refresh token is required');
      }
      
      const { token, user } = await authService.refreshToken(refreshToken);
      
      res.json({
        message: 'Token refreshed successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  /**
   * Solicita redefinição de senha
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const tenantId = req.tenantId;
      
      await authService.requestPasswordReset(email, tenantId);
      
      res.json({
        message: 'Password reset instructions sent to email',
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  /**
   * Redefine a senha com token
   * POST /api/auth/reset-password/:token
   */
  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password } = req.body;
      
      if (!password) {
        throw new ValidationError('New password is required');
      }
      
      await authService.resetPassword(token, password);
      
      res.json({
        message: 'Password reset successful',
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  /**
   * Método utilitário para tratamento de erros
   * @param {Error} error - Erro a ser tratado
   * @param {Response} res - Objeto de resposta Express
   */
  handleError(error, res) {
    console.error('Auth controller error:', error);
    
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.message,
      });
    }
    
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: error.message,
      });
    }
    
    if (error instanceof ConflictError) {
      return res.status(409).json({
        error: 'Conflict',
        message: error.message,
      });
    }
    
    // Erro genérico
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    });
  }
}

module.exports = new AuthController();