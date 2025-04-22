// src/controllers/todoController.js

const todoService = require('../services/todoService');
const { ValidationError, NotFoundError, ForbiddenError } = require('../utils/errors');

/**
 * Controller de Todos - Gerencia requisições HTTP
 * Processa requisições, valida parâmetros e retorna respostas apropriadas
 */
class TodoController {
  /**
   * Cria um novo todo
   * POST /todos
   */
  async createTodo(req, res) {
    try {
      const todoData = req.body;
      const userId = req.userId;
      const tenantId = req.tenantId;
      
      const todo = await todoService.createTodo(todoData, userId, tenantId);
      
      res.status(201).json({
        message: 'Todo created successfully',
        data: todo,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  /**
   * Obtém um todo específico
   * GET /todos/:id
   */
  async getTodo(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      const tenantId = req.tenantId;
      
      const todo = await todoService.getTodoById(id, userId, tenantId);
      
      res.json({
        data: todo,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  /**
   * Lista todos os todos do usuário
   * GET /todos
   */
  async listTodos(req, res) {
    try {
      const userId = req.userId;
      const tenantId = req.tenantId;
      const { status, priority, todoListId, search, page, pageSize } = req.query;
      
      const filters = {
        status,
        priority,
        todoListId,
        search,
      };
      
      const todos = await todoService.listUserTodos(userId, tenantId, filters);
      
      res.json({
        data: todos,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  /**
   * Lista todos de uma lista específica
   * GET /lists/:listId/todos
   */
  async listTodosByList(req, res) {
    try {
      const { listId } = req.params;
      const userId = req.userId;
      const tenantId = req.tenantId;
      const { status, priority } = req.query;
      
      const filters = {
        status,
        priority,
      };
      
      const todos = await todoService.listTodosByList(listId, userId, tenantId, filters);
      
      res.json({
        data: todos,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  /**
   * Atualiza um todo
   * PATCH /todos/:id
   */
  async updateTodo(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.userId;
      const tenantId = req.tenantId;
      
      const todo = await todoService.updateTodo(id, updateData, userId, tenantId);
      
      res.json({
        message: 'Todo updated successfully',
        data: todo,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  /**
   * Exclui um todo
   * DELETE /todos/:id
   */
  async deleteTodo(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      const tenantId = req.tenantId;
      
      await todoService.deleteTodo(id, userId, tenantId);
      
      res.json({
        message: 'Todo deleted successfully',
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  /**
   * Atualiza o status de um todo
   * PATCH /todos/:id/status
   */
  async updateTodoStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.userId;
      const tenantId = req.tenantId;
      
      if (!status) {
        throw new ValidationError('Status is required');
      }
      
      const todo = await todoService.updateTodoStatus(id, status, userId, tenantId);
      
      res.json({
        message: 'Todo status updated successfully',
        data: todo,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  /**
   * Move um todo para outra lista
   * PATCH /todos/:id/move
   */
  async moveTodoToList(req, res) {
    try {
      const { id } = req.params;
      const { todoListId } = req.body;
      const userId = req.userId;
      const tenantId = req.tenantId;
      
      const todo = await todoService.moveTodoToList(id, todoListId, userId, tenantId);
      
      res.json({
        message: 'Todo moved successfully',
        data: todo,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  /**
   * Obtém todos próximos ao vencimento
   * GET /todos/upcoming
   */
  async getUpcomingTodos(req, res) {
    try {
      const userId = req.userId;
      const tenantId = req.tenantId;
      
      const todos = await todoService.getUpcomingTodos(userId, tenantId);
      
      res.json({
        data: todos,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  /**
   * Obtém todos atrasados
   * GET /todos/overdue
   */
  async getOverdueTodos(req, res) {
    try {
      const userId = req.userId;
      const tenantId = req.tenantId;
      
      const todos = await todoService.getOverdueTodos(userId, tenantId);
      
      res.json({
        data: todos,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  /**
   * Obtém estatísticas do usuário
   * GET /todos/statistics
   */
  async getUserStatistics(req, res) {
    try {
      const userId = req.userId;
      const tenantId = req.tenantId;
      
      const statistics = await todoService.getUserStatistics(userId, tenantId);
      
      res.json({
        data: statistics,
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
    console.error('Todo controller error:', error);
    
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.message,
      });
    }
    
    if (error instanceof NotFoundError) {
      return res.status(404).json({
        error: 'Not Found',
        message: error.message,
      });
    }
    
    if (error instanceof ForbiddenError) {
      return res.status(403).json({
        error: 'Forbidden',
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

module.exports = new TodoController();