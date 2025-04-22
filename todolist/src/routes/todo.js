// src/routes/todo.js

const express = require('express');
const todoController = require('../controllers/todoController');
const { authMiddleware } = require('../middleware/auth');
const { requireTenant } = require('../middleware/tenant');

const router = express.Router();

/**
 * Rotas para gerenciamento de todos
 * Todas as rotas requerem autenticação e contexto de tenant
 */

// Middleware aplicado a todas as rotas de todos
router.use(authMiddleware);
router.use(requireTenant);

// Rotas de estatísticas e filtros especiais
router.get('/upcoming', (req, res) => todoController.getUpcomingTodos(req, res));
router.get('/overdue', (req, res) => todoController.getOverdueTodos(req, res));
router.get('/statistics', (req, res) => todoController.getUserStatistics(req, res));

// CRUD básico de todos
router.post('/', (req, res) => todoController.createTodo(req, res));
router.get('/', (req, res) => todoController.listTodos(req, res));
router.get('/:id', (req, res) => todoController.getTodo(req, res));
router.patch('/:id', (req, res) => todoController.updateTodo(req, res));
router.delete('/:id', (req, res) => todoController.deleteTodo(req, res));

// Operações específicas de todos
router.patch('/:id/status', (req, res) => todoController.updateTodoStatus(req, res));
router.patch('/:id/move', (req, res) => todoController.moveTodoToList(req, res));

module.exports = router;