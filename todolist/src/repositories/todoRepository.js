// src/repositories/todoRepository.js

const BaseRepository = require('./baseRepository');

/**
 * Repositório para operações com Todos
 * Estende do BaseRepository para herdar filtro automático por tenant
 */
class TodoRepository extends BaseRepository {
  constructor() {
    super('todo');
  }
  
  /**
   * Busca todos os todos de um usuário específico
   * @param {string} userId - ID do usuário
   * @param {string} tenantId - ID do tenant
   * @param {object} options - Opções de filtragem e ordenação
   */
  async findByUser(userId, tenantId, options = {}) {
    const { 
      status, 
      priority,
      todoListId,
      search,
      orderBy = { createdAt: 'desc' }
    } = options;
    
    // Constrói o where clause com filtros dinâmicos
    const where = {
      userId,
    };
    
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (todoListId) where.todoListId = todoListId;
    
    // Adiciona busca por título ou descrição
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    return this.findMany(where, tenantId, {
      orderBy,
      include: {
        todoList: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }
  
  /**
   * Busca todos os todos de uma lista específica
   * @param {string} todoListId - ID da lista de todos
   * @param {string} tenantId - ID do tenant
   * @param {object} options - Opções de filtragem
   */
  async findByTodoList(todoListId, tenantId, options = {}) {
    const { 
      status, 
      priority,
      orderBy = { createdAt: 'desc' }
    } = options;
    
    const where = {
      todoListId,
    };
    
    if (status) where.status = status;
    if (priority) where.priority = priority;
    
    return this.findMany(where, tenantId, {
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
  
  /**
   * Busca todos com vencimento próximo (próximos 7 dias)
   * @param {string} userId - ID do usuário
   * @param {string} tenantId - ID do tenant
   */
  async findUpcoming(userId, tenantId) {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const where = {
      userId,
      dueDate: {
        gte: today,
        lte: nextWeek,
      },
      status: {
        not: 'COMPLETED',
      },
    };
    
    return this.findMany(where, tenantId, {
      orderBy: { dueDate: 'asc' },
      include: {
        todoList: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }
  
  /**
   * Busca todos atrasados
   * @param {string} userId - ID do usuário
   * @param {string} tenantId - ID do tenant
   */
  async findOverdue(userId, tenantId) {
    const today = new Date();
    
    const where = {
      userId,
      dueDate: {
        lt: today,
      },
      status: {
        not: 'COMPLETED',
      },
    };
    
    return this.findMany(where, tenantId, {
      orderBy: { dueDate: 'asc' },
      include: {
        todoList: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }
  
  /**
   * Busca estatísticas de todos do usuário
   * @param {string} userId - ID do usuário
   * @param {string} tenantId - ID do tenant
   */
  async getStatistics(userId, tenantId) {
    const where = this.addTenantFilter({ userId }, tenantId);
    
    // Executa múltiplas consultas em paralelo para performance
    const [
      total,
      completed,
      inProgress,
      pending,
      overdue,
      highPriority,
    ] = await Promise.all([
      // Total de todos
      this.count(where, tenantId),
      
      // Todos completados
      this.count({ ...where, status: 'COMPLETED' }, tenantId),
      
      // Todos em progresso
      this.count({ ...where, status: 'IN_PROGRESS' }, tenantId),
      
      // Todos pendentes
      this.count({ ...where, status: 'PENDING' }, tenantId),
      
      // Todos atrasados
      this.count({
        ...where,
        dueDate: { lt: new Date() },
        status: { not: 'COMPLETED' },
      }, tenantId),
      
      // Todos com alta prioridade
      this.count({
        ...where,
        priority: { in: ['HIGH', 'URGENT'] },
        status: { not: 'COMPLETED' },
      }, tenantId),
    ]);
    
    return {
      total,
      completed,
      inProgress,
      pending,
      overdue,
      highPriority,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    };
  }
  
  /**
   * Move um todo para outra lista
   * @param {string} todoId - ID do todo
   * @param {string} newTodoListId - ID da nova lista (null para remover da lista)
   * @param {string} tenantId - ID do tenant
   */
  async moveToList(todoId, newTodoListId, tenantId) {
    return this.update(todoId, { todoListId: newTodoListId }, tenantId);
  }
  
  /**
   * Atualiza o status de um todo
   * @param {string} todoId - ID do todo
   * @param {string} status - Novo status
   * @param {string} tenantId - ID do tenant
   */
  async updateStatus(todoId, status, tenantId) {
    return this.update(todoId, { status }, tenantId);
  }
}

module.exports = new TodoRepository();