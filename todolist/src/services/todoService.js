// src/services/todoService.js

const todoRepository = require('../repositories/todoRepository');
const { ValidationError, NotFoundError } = require('../utils/errors');

/**
 * Serviço de Todos - Lógica de negócio
 * Valida dados, aplica regras de negócio e orquestra repositórios
 */
class TodoService {
  /**
   * Cria um novo todo
   * @param {object} todoData - Dados do todo
   * @param {string} userId - ID do usuário
   * @param {string} tenantId - ID do tenant
   */
  async createTodo(todoData, userId, tenantId) {
    // Validação básica
    this.validateTodoData(todoData);
    
    // Prepara os dados para criação
    const todo = {
      ...todoData,
      userId,
      status: todoData.status || 'PENDING',
      priority: todoData.priority || 'MEDIUM',
    };
    
    // Se houver data de vencimento, converte para Date
    if (todo.dueDate) {
      todo.dueDate = new Date(todo.dueDate);
    }
    
    return todoRepository.create(todo, tenantId);
  }
  
  /**
   * Obtém um todo por ID
   * @param {string} todoId - ID do todo
   * @param {string} userId - ID do usuário
   * @param {string} tenantId - ID do tenant
   */
  async getTodoById(todoId, userId, tenantId) {
    const todo = await todoRepository.findById(todoId, tenantId);
    
    if (!todo) {
      throw new NotFoundError('Todo not found');
    }
    
    // Verifica se o usuário tem permissão para acessar o todo
    if (todo.userId !== userId) {
      throw new ForbiddenError('Not authorized to access this todo');
    }
    
    return todo;
  }
  
  /**
   * Lista todos os todos do usuário
   * @param {string} userId - ID do usuário
   * @param {string} tenantId - ID do tenant
   * @param {object} filters - Filtros de busca
   */
  async listUserTodos(userId, tenantId, filters = {}) {
    return todoRepository.findByUser(userId, tenantId, filters);
  }
  
  /**
   * Lista todos de uma lista específica
   * @param {string} todoListId - ID da lista
   * @param {string} userId - ID do usuário
   * @param {string} tenantId - ID do tenant
   * @param {object} filters - Filtros de busca
   */
  async listTodosByList(todoListId, userId, tenantId, filters = {}) {
    // Verifica se o usuário tem acesso à lista
    // Aqui você adicionaria lógica para verificar se o usuário tem permissão
    
    return todoRepository.findByTodoList(todoListId, tenantId, filters);
  }
  
  /**
   * Atualiza um todo
   * @param {string} todoId - ID do todo
   * @param {object} updateData - Dados para atualização
   * @param {string} userId - ID do usuário
   * @param {string} tenantId - ID do tenant
   */
  async updateTodo(todoId, updateData, userId, tenantId) {
    // Verifica se o todo existe e pertence ao usuário
    const todo = await this.getTodoById(todoId, userId, tenantId);
    
    // Valida dados de atualização
    if (updateData.title !== undefined && (!updateData.title || updateData.title.trim().length === 0)) {
      throw new ValidationError('Title cannot be empty');
    }
    
    // Se houver data de vencimento, converte para Date
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }
    
    return todoRepository.update(todoId, updateData, tenantId);
  }
  
  /**
   * Exclui um todo
   * @param {string} todoId - ID do todo
   * @param {string} userId - ID do usuário
   * @param {string} tenantId - ID do tenant
   */
  async deleteTodo(todoId, userId, tenantId) {
    // Verifica se o todo existe e pertence ao usuário
    await this.getTodoById(todoId, userId, tenantId);
    
    return todoRepository.delete(todoId, tenantId);
  }
  
  /**
   * Atualiza o status de um todo
   * @param {string} todoId - ID do todo
   * @param {string} status - Novo status
   * @param {string} userId - ID do usuário
   * @param {string} tenantId - ID do tenant
   */
  async updateTodoStatus(todoId, status, userId, tenantId) {
    // Valida o status
    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    // Verifica se o todo existe e pertence ao usuário
    await this.getTodoById(todoId, userId, tenantId);
    
    return todoRepository.updateStatus(todoId, status, tenantId);
  }
  
  /**
   * Move um todo para outra lista
   * @param {string} todoId - ID do todo
   * @param {string} newTodoListId - ID da nova lista (null para remover da lista)
   * @param {string} userId - ID do usuário
   * @param {string} tenantId - ID do tenant
   */
  async moveTodoToList(todoId, newTodoListId, userId, tenantId) {
    // Verifica se o todo existe e pertence ao usuário
    await this.getTodoById(todoId, userId, tenantId);
    
    // Se houver uma nova lista, verifica se existe e pertence ao tenant
    if (newTodoListId) {
      // Aqui você adicionaria validação para verificar se a lista existe
      // e se o usuário tem permissão para adicionar todos nela
    }
    
    return todoRepository.moveToList(todoId, newTodoListId, tenantId);
  }
  
  /**
   * Obtém todos próximos ao vencimento
   * @param {string} userId - ID do usuário
   * @param {string} tenantId - ID do tenant
   */
  async getUpcomingTodos(userId, tenantId) {
    return todoRepository.findUpcoming(userId, tenantId);
  }
  
  /**
   * Obtém todos atrasados
   * @param {string} userId - ID do usuário
   * @param {string} tenantId - ID do tenant
   */
  async getOverdueTodos(userId, tenantId) {
    return todoRepository.findOverdue(userId, tenantId);
  }
  
  /**
   * Obtém estatísticas dos todos do usuário
   * @param {string} userId - ID do usuário
   * @param {string} tenantId - ID do tenant
   */
  async getUserStatistics(userId, tenantId) {
    return todoRepository.getStatistics(userId, tenantId);
  }
  
  /**
   * Valida dados do todo
   * @param {object} todoData - Dados do todo
   */
  validateTodoData(todoData) {
    if (!todoData.title || todoData.title.trim().length === 0) {
      throw new ValidationError('Title is required');
    }
    
    if (todoData.title.length > 255) {
      throw new ValidationError('Title cannot exceed 255 characters');
    }
    
    if (todoData.description && todoData.description.length > 1000) {
      throw new ValidationError('Description cannot exceed 1000 characters');
    }
    
    if (todoData.priority) {
      const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
      if (!validPriorities.includes(todoData.priority)) {
        throw new ValidationError(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
      }
    }
    
    if (todoData.dueDate && isNaN(new Date(todoData.dueDate).getTime())) {
      throw new ValidationError('Invalid due date');
    }
  }
}

module.exports = new TodoService();