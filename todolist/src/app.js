// src/app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { tenantMiddleware } = require('./middleware/tenant');
const { errorHandler } = require('./utils/errors');
const config = require('./config/environment');

// Importar rotas
const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todo');
const tenantRoutes = require('./routes/tenant');

// Criar aplicação Express
const app = express();

/**
 * Middlewares globais
 */

// Segurança básica com helmet
app.use(helmet());

// CORS - Permitir requisições cross-origin
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
}));

// Parse de JSON e dados de formulário
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging de requisições (apenas em desenvolvimento)
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting - Limitar requisições por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo de 100 requisições por IP
  message: {
    error: 'Too many requests',
    message: 'Please try again later',
  },
});
app.use(limiter);

// Middleware de identificação de tenant - DEVE ser o primeiro
app.use(tenantMiddleware);

/**
 * Rotas da aplicação
 */

// Rota de health check (não requer autenticação)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas públicas (não requerem autenticação)
app.use('/api/auth', authRoutes);

// Rotas protegidas (requerem autenticação)
app.use('/api/todos', todoRoutes);

// Rotas administrativas (apenas para domínio principal)
app.use('/api/tenants', tenantRoutes);

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist',
  });
});

// Middleware de tratamento de erros (DEVE ser o último)
app.use(errorHandler);

module.exports = app;