// src/services/tenantService.js

const tenantRepository = require('../repositories/tenantRepository');
const userRepository = require('../repositories/userRepository');
const todoRepository = require('../repositories/todoRepository');
const { ValidationError, NotFoundError, ConflictError } = require('../utils/errors');

/**
 * Serviço de Tenant
 * Gerencia lógica de negócio relacionada a tenants
 */
class TenantService {
  /**
   * Lista todos os tenants com paginação
   * @param {object} options - Opções de listagem
   */
  async listTenants(options = {}) {
    const { page = 1, pageSize = 10, search, isActive } = options;
    
    const where = {};
    
    // Filtro de busca por nome ou subdomínio
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { subdomain: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Filtro por status
    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }
    
    return tenantRepository.findPaginated(where, null, page, pageSize, {
      orderBy: { createdAt: 'desc' },
    });
  }
  
  /**
   * Cria um novo tenant
   * @param {object} tenantData - Dados do tenant
   */
  async createTenant(tenantData) {
    // Valida o subdomínio
    if (!/^[a-z0-9-]+$/.test(tenantData.subdomain)) {
      throw new ValidationError('Subdomain can only contain lowercase letters, numbers and hyphens');
    }
    
    // Verifica se o subdomínio já existe
    const existingTenant = await tenantRepository.findBySubdomain(tenantData.subdomain);
    
    if (existingTenant) {
      throw new ConflictError('Subdomain already exists');
    }
    
    // Cria o tenant
    const tenant = await tenantRepository.create(tenantData);
    
    return tenant;
  }
  
  /**
   * Obtém um tenant por ID
   * @param {string} id - ID do tenant
   */
  async getTenantById(id) {
    const tenant = await tenantRepository.findById(id);
    
    if (!tenant) {
      throw new NotFoundError('Tenant not found');
    }
    
    return tenant;
  }
  
  /**
   * Atualiza um tenant
   * @param {string} id - ID do tenant
   * @param {object} updateData - Dados para atualização
   */
  async updateTenant(id, updateData) {
    // Se estiver atualizando o subdomínio, verifica se está disponível
    if (updateData.subdomain) {
      const existingTenant = await tenantRepository.findBySubdomain(updateData.subdomain);
      
      if (existingTenant && existingTenant.id !== id) {
        throw new ConflictError('Subdomain already exists');
      }
    }
    
    const tenant = await tenantRepository.update(id, updateData);
    
    return tenant;
  }
  
  /**
   * Atualiza o status de um tenant
   * @param {string} id - ID do tenant
   * @param {boolean} isActive - Novo status
   */
  async updateTenantStatus(id, isActive) {
    const tenant = await this.getTenantById(id);
    
    // Se estiver desativando o tenant, podemos adicionar lógica adicional aqui
    // Por exemplo, notificar usuários, desativar serviços, etc.
    
    const updatedTenant = await tenantRepository.update(id, { isActive });
    
    return updatedTenant;
  }
  
  /**
   * Obtém estatísticas do tenant
   * @param {string} id - ID do tenant
   */
  async getTenantStatistics(id) {
    const tenant = await this.getTenantById(id);
    
    // Obtém estatísticas de usuários
    const totalUsers = await userRepository.count({ tenantId: id });
    const activeUsers = await userRepository.count({ tenantId: id, isActive: true });
    
    // Obtém estatísticas de todos
    const totalTodos = await todoRepository.count({ tenantId: id });
    const completedTodos = await todoRepository.count({ 
      tenantId: id, 
      status: 'COMPLETED' 
    });
    
    return {
      users: {
        total: totalUsers,
        active: activeUsers,
      },
      todos: {
        total: totalTodos,
        completed: completedTodos,
        completionRate: totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0,
      },
      createdAt: tenant.createdAt,
      lastUpdated: tenant.updatedAt,
    };
  }
  
  /**
   * Verifica disponibilidade de subdomínio
   * @param {string} subdomain - Subdomínio a verificar
   */
  async checkSubdomainAvailability(subdomain) {
    // Valida o formato do subdomínio
    if (!/^[a-z0-9-]+$/.test(subdomain)) {
      throw new ValidationError('Invalid subdomain format');
    }
    
    const existingTenant = await tenantRepository.findBySubdomain(subdomain);
    
    return !existingTenant;
  }
}

module.exports = new TenantService();