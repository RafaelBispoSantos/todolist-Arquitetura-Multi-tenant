// src/repositories/baseRepository.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Repositório base que implementa filtro automático por tenant
 * Todas as operações de banco de dados passam por aqui para garantir
 * que os dados sejam filtrados pelo tenantId correto
 */
class BaseRepository {
  /**
   * @param {string} modelName - Nome do modelo do Prisma (ex: 'user', 'todo')
   */
  constructor(modelName) {
    this.model = prisma[modelName];
    this.modelName = modelName;
  }
  
  /**
   * Adiciona filtro de tenant ao where clause
   * @param {object} where - Cláusula where original
   * @param {string} tenantId - ID do tenant para filtrar
   * @returns {object} Cláusula where com filtro de tenant
   */
  addTenantFilter(where, tenantId) {
    // Se não houver tenantId, retorna o where original
    if (!tenantId) return where;
    
    // Se where for null/undefined, cria novo objeto com tenantId
    if (!where) return { tenantId };
    
    // Adiciona tenantId ao where clause
    return { ...where, tenantId };
  }
  
  /**
   * Busca um único registro pelo ID
   * @param {string} id - ID do registro
   * @param {string} tenantId - ID do tenant
   * @param {object} options - Opções adicionais do Prisma (select, include)
   */
  async findById(id, tenantId, options = {}) {
    const where = this.addTenantFilter({ id }, tenantId);
    
    return this.model.findFirst({
      where,
      ...options,
    });
  }
  
  /**
   * Busca um único registro por critérios
   * @param {object} where - Critérios de busca
   * @param {string} tenantId - ID do tenant
   * @param {object} options - Opções adicionais do Prisma
   */
  async findOne(where, tenantId, options = {}) {
    const filteredWhere = this.addTenantFilter(where, tenantId);
    
    return this.model.findFirst({
      where: filteredWhere,
      ...options,
    });
  }
  
  /**
   * Busca todos os registros que atendem aos critérios
   * @param {object} where - Critérios de busca
   * @param {string} tenantId - ID do tenant
   * @param {object} options - Opções adicionais do Prisma
   */
  async findMany(where, tenantId, options = {}) {
    const filteredWhere = this.addTenantFilter(where, tenantId);
    
    return this.model.findMany({
      where: filteredWhere,
      ...options,
    });
  }
  
  /**
   * Cria um novo registro
   * @param {object} data - Dados para criar
   * @param {string} tenantId - ID do tenant
   */
  async create(data, tenantId) {
    // Adiciona tenantId aos dados se o modelo tiver esse campo
    const finalData = { ...data };
    if (tenantId && this.model.fields.tenantId) {
      finalData.tenantId = tenantId;
    }
    
    return this.model.create({
      data: finalData,
    });
  }
  
  /**
   * Atualiza um registro existente
   * @param {string} id - ID do registro
   * @param {object} data - Dados para atualizar
   * @param {string} tenantId - ID do tenant
   */
  async update(id, data, tenantId) {
    const where = this.addTenantFilter({ id }, tenantId);
    
    // Verifica se o registro existe antes de atualizar
    const exists = await this.model.findFirst({ where });
    if (!exists) {
      throw new Error(`${this.modelName} not found`);
    }
    
    return this.model.update({
      where: { id },
      data,
    });
  }
  
  /**
   * Exclui um registro
   * @param {string} id - ID do registro
   * @param {string} tenantId - ID do tenant
   */
  async delete(id, tenantId) {
    const where = this.addTenantFilter({ id }, tenantId);
    
    // Verifica se o registro existe antes de excluir
    const exists = await this.model.findFirst({ where });
    if (!exists) {
      throw new Error(`${this.modelName} not found`);
    }
    
    return this.model.delete({
      where: { id },
    });
  }
  
  /**
   * Conta registros que atendem aos critérios
   * @param {object} where - Critérios de busca
   * @param {string} tenantId - ID do tenant
   */
  async count(where, tenantId) {
    const filteredWhere = this.addTenantFilter(where, tenantId);
    
    return this.model.count({
      where: filteredWhere,
    });
  }
  
  /**
   * Busca registros com paginação
   * @param {object} where - Critérios de busca
   * @param {string} tenantId - ID do tenant
   * @param {number} page - Número da página (começa em 1)
   * @param {number} pageSize - Tamanho da página
   * @param {object} options - Opções adicionais do Prisma
   */
  async findPaginated(where, tenantId, page = 1, pageSize = 10, options = {}) {
    const filteredWhere = this.addTenantFilter(where, tenantId);
    const skip = (page - 1) * pageSize;
    
    const [data, total] = await Promise.all([
      this.model.findMany({
        where: filteredWhere,
        skip,
        take: pageSize,
        ...options,
      }),
      this.model.count({
        where: filteredWhere,
      }),
    ]);
    
    return {
      data,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}

module.exports = BaseRepository;