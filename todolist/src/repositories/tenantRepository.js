// src/repositories/tenantRepository.js

const BaseRepository = require('./baseRepository');

/**
 * Repositório de Tenants
 * Estende do BaseRepository, mas não precisa de filtro por tenant
 * já que os tenants são a entidade raiz
 */
class TenantRepository extends BaseRepository {
  constructor() {
    super('tenant');
  }
  
  /**
   * Busca um tenant pelo subdomínio
   * @param {string} subdomain - Subdomínio do tenant
   */
  async findBySubdomain(subdomain) {
    return this.findOne({ subdomain }, null);
  }
  
  /**
   * Busca tenants ativos
   * @param {object} options - Opções de ordenação e paginação
   */
  async findActiveTenants(options = {}) {
    return this.findMany({ isActive: true }, null, options);
  }
  
  /**
   * Busca tenants com filtros
   * @param {object} filters - Filtros de busca
   * @param {object} options - Opções de ordenação e paginação
   */
  async findWithFilters(filters = {}, options = {}) {
    const where = {};
    
    // Filtro por nome
    if (filters.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }
    
    // Filtro por status
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    
    // Filtro por data de criação
    if (filters.createdAfter) {
      where.createdAt = { gte: new Date(filters.createdAfter) };
    }
    
    return this.findMany(where, null, options);
  }
  
  /**
   * Conta tenants com filtros
   * @param {object} filters - Filtros de busca
   */
  async countWithFilters(filters = {}) {
    const where = {};
    
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    
    return this.count(where, null);
  }
  
  /**
   * Verifica se um subdomínio está disponível
   * @param {string} subdomain - Subdomínio a verificar
   */
  async isSubdomainAvailable(subdomain) {
    const existingTenant = await this.findBySubdomain(subdomain);
    return !existingTenant;
  }
  
  /**
   * Obtém todos os tenants com estatísticas
   * @param {object} options - Opções de paginação
   */
  async findWithStatistics(options = {}) {
    const { page = 1, pageSize = 10 } = options;
    
    // Aqui poderíamos usar agregações para incluir contagens de usuários e todos
    // Por enquanto, retornamos apenas os dados básicos
    return this.findPaginated({}, null, page, pageSize, {
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            users: true,
            todos: true,
          },
        },
      },
    });
  }
  
  /**
   * Atualiza as configurações do tenant
   * @param {string} tenantId - ID do tenant
   * @param {object} settingsData - Dados de configuração
   */
  async updateSettings(tenantId, settingsData) {
    const allowedFields = ['primaryColor', 'logoUrl', 'name'];
    const updateData = {};
    
    // Filtra apenas os campos permitidos
    for (const field of allowedFields) {
      if (settingsData[field] !== undefined) {
        updateData[field] = settingsData[field];
      }
    }
    
    return this.update(tenantId, updateData, null);
  }
}

module.exports = new TenantRepository();