// src/repositories/userRepository.js

const BaseRepository = require('./baseRepository');

/**
 * Repositório de Usuários
 * Estende do BaseRepository para herdar filtro automático por tenant
 */
class UserRepository extends BaseRepository {
  constructor() {
    super('user');
  }
  
  /**
   * Busca um usuário pelo email
   * @param {string} email - Email do usuário
   * @param {string} tenantId - ID do tenant
   */
  async findByEmail(email, tenantId) {
    return this.findOne({ email }, tenantId);
  }
  
  /**
   * Busca usuários por role
   * @param {string} role - Role do usuário (ADMIN, USER)
   * @param {string} tenantId - ID do tenant
   */
  async findByRole(role, tenantId) {
    return this.findMany({ role }, tenantId);
  }
  
  /**
   * Busca usuários ativos
   * @param {string} tenantId - ID do tenant
   */
  async findActiveUsers(tenantId) {
    return this.findMany({ isActive: true }, tenantId);
  }
  
  /**
   * Atualiza a senha do usuário
   * @param {string} userId - ID do usuário
   * @param {string} hashedPassword - Senha criptografada
   */
  async updatePassword(userId, hashedPassword) {
    return this.model.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
  
  /**
   * Atualiza o perfil do usuário
   * @param {string} userId - ID do usuário
   * @param {object} profileData - Dados do perfil
   * @param {string} tenantId - ID do tenant
   */
  async updateProfile(userId, profileData, tenantId) {
    const allowedFields = ['name', 'email'];
    const updateData = {};
    
    // Filtra apenas os campos permitidos
    for (const field of allowedFields) {
      if (profileData[field] !== undefined) {
        updateData[field] = profileData[field];
      }
    }
    
    return this.update(userId, updateData, tenantId);
  }
  
  /**
   * Ativa/desativa um usuário
   * @param {string} userId - ID do usuário
   * @param {boolean} isActive - Status de ativação
   * @param {string} tenantId - ID do tenant
   */
  async toggleUserStatus(userId, isActive, tenantId) {
    return this.update(userId, { isActive }, tenantId);
  }
  
  /**
   * Conta usuários por tenant
   * @param {string} tenantId - ID do tenant
   * @param {object} filters - Filtros adicionais
   */
  async countByTenant(tenantId, filters = {}) {
    return this.count(filters, tenantId);
  }
  
  /**
   * Busca usuários com paginação
   * @param {string} tenantId - ID do tenant
   * @param {object} filters - Filtros de busca
   * @param {number} page - Número da página
   * @param {number} pageSize - Tamanho da página
   */
  async findPaginatedUsers(tenantId, filters = {}, page = 1, pageSize = 10) {
    const where = {};
    
    // Filtro por nome ou email
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    
    // Filtro por role
    if (filters.role) {
      where.role = filters.role;
    }
    
    // Filtro por status
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    
    return this.findPaginated(where, tenantId, page, pageSize, {
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Não inclui a senha no resultado
      },
    });
  }
}

module.exports = new UserRepository();