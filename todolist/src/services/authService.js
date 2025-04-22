// src/services/authService.js

const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const { generateToken, verifyToken } = require('../utils/jwt');
const { ValidationError, UnauthorizedError, ConflictError, NotFoundError } = require('../utils/errors');
const config = require('../config/environment');

/**
 * Serviço de Autenticação
 * Gerencia lógica de negócio relacionada a autenticação
 */
class AuthService {
  /**
   * Registra um novo usuário
   * @param {object} userData - Dados do usuário
   * @param {string} tenantId - ID do tenant
   */
  async registerUser(userData, tenantId) {
    // Verifica se o email já existe no tenant
    const existingUser = await userRepository.findByEmail(userData.email, tenantId);
    
    if (existingUser) {
      throw new ConflictError('Email already registered in this organization');
    }
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(userData.password, config.security.bcryptRounds);
    
    // Cria o usuário
    const user = await userRepository.create({
      ...userData,
      password: hashedPassword,
      role: 'USER', // Role padrão para novos usuários
    }, tenantId);
    
    // Gera o token JWT
    const token = generateToken({
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
    });
    
    return { user, token };
  }
  
  /**
   * Realiza login de usuário
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @param {string} tenantId - ID do tenant
   */
  async loginUser(email, password, tenantId) {
    // Busca o usuário pelo email
    const user = await userRepository.findByEmail(email, tenantId);
    
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }
    
    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }
    
    // Verifica se o usuário está ativo
    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }
    
    // Gera o token JWT
    const token = generateToken({
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
    });
    
    return { user, token };
  }
  
  /**
   * Obtém o perfil do usuário
   * @param {string} userId - ID do usuário
   * @param {string} tenantId - ID do tenant
   */
  async getUserProfile(userId, tenantId) {
    const user = await userRepository.findById(userId, tenantId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    return user;
  }
  
  /**
   * Renova o token de acesso
   * @param {string} refreshToken - Token de refresh
   */
  async refreshToken(refreshToken) {
    try {
      // Verifica o refresh token
      const decoded = verifyToken(refreshToken);
      
      // Busca o usuário
      const user = await userRepository.findById(decoded.userId, decoded.tenantId);
      
      if (!user || !user.isActive) {
        throw new UnauthorizedError('Invalid refresh token');
      }
      
      // Gera novo token de acesso
      const token = generateToken({
        userId: user.id,
        tenantId: user.tenantId,
        role: user.role,
      });
      
      return { token, user };
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }
  
  /**
   * Solicita reset de senha
   * @param {string} email - Email do usuário
   * @param {string} tenantId - ID do tenant
   */
  async requestPasswordReset(email, tenantId) {
    const user = await userRepository.findByEmail(email, tenantId);
    
    if (!user) {
      // Por segurança, não informamos se o email existe ou não
      return;
    }
    
    // Gera token de reset de senha
    const resetToken = generateToken(
      { userId: user.id, purpose: 'password-reset' },
      '1h' // Token válido por 1 hora
    );
    
    // Em um cenário real, enviaria um email com o link de reset
    // Aqui apenas retornamos o token para demonstração
    return resetToken;
  }
  
  /**
   * Redefine a senha
   * @param {string} resetToken - Token de reset
   * @param {string} newPassword - Nova senha
   */
  async resetPassword(resetToken, newPassword) {
    try {
      // Verifica o token de reset
      const decoded = verifyToken(resetToken);
      
      if (decoded.purpose !== 'password-reset') {
        throw new ValidationError('Invalid reset token');
      }
      
      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(newPassword, config.security.bcryptRounds);
      
      // Atualiza a senha do usuário
      await userRepository.updatePassword(decoded.userId, hashedPassword);
      
      return true;
    } catch (error) {
      throw new ValidationError('Invalid or expired reset token');
    }
  }
}

module.exports = new AuthService();