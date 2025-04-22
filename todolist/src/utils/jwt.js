// src/utils/jwt.js

const jwt = require('jsonwebtoken');
const config = require('../config/environment');

/**
 * Gera um token JWT
 * @param {object} payload - Dados para incluir no token
 * @param {string} expiresIn - Tempo de expiração (opcional)
 * @returns {string} Token JWT
 */
const generateToken = (payload, expiresIn = config.jwt.expiresIn) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn,
  });
};

/**
 * Verifica e decodifica um token JWT
 * @param {string} token - Token JWT
 * @returns {object} Payload decodificado
 * @throws {Error} Se o token for inválido ou expirado
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
};

/**
 * Gera um refresh token
 * @param {object} payload - Dados para incluir no token
 * @returns {string} Refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: '7d', // Refresh token válido por 7 dias
  });
};

/**
 * Extrai o token do header Authorization
 * @param {string} authHeader - Header Authorization
 * @returns {string|null} Token extraído ou null se não existir
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.split(' ')[1];
};

module.exports = {
  generateToken,
  verifyToken,
  generateRefreshToken,
  extractTokenFromHeader,
};