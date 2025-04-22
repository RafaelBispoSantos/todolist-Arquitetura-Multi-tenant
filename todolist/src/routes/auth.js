// src/routes/auth.js

const express = require('express');
const authController = require('../controllers/authController');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validation');
const { requireTenant } = require('../middleware/tenant');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

/**
 * Rotas de autenticação
 * Gerencia login, registro e tokens JWT
 */

// Registro de novo usuário (requer contexto de tenant)
router.post('/register', 
  requireTenant,
  validateUserRegistration, 
  (req, res) => authController.register(req, res)
);

// Login de usuário (requer contexto de tenant)
router.post('/login', 
  requireTenant,
  validateUserLogin, 
  (req, res) => authController.login(req, res)
);

// Logout de usuário (para invalidar token)
router.post('/logout', 
  authMiddleware, 
  (req, res) => authController.logout(req, res)
);

// Verifica se o token é válido
router.get('/verify', 
  authMiddleware, 
  (req, res) => authController.verifyToken(req, res)
);

// Obtém informações do usuário atual
router.get('/me', 
  authMiddleware, 
  (req, res) => authController.getCurrentUser(req, res)
);

// Refresh token
router.post('/refresh-token', 
  (req, res) => authController.refreshToken(req, res)
);

// Solicita redefinição de senha
router.post('/forgot-password', 
  validateUserLogin, 
  (req, res) => authController.forgotPassword(req, res)
);

// Redefine a senha com token
router.post('/reset-password/:token', 
  (req, res) => authController.resetPassword(req, res)
);

module.exports = router;