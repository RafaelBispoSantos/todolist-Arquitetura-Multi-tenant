// src/routes/tenant.js

const express = require('express');
const tenantController = require('../controllers/tenantController');
const { validateTenantCreate, validateUUID, validatePagination } = require('../middleware/validation');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * Rotas administrativas de tenant
 * Gerencia criação e gerenciamento de tenants (apenas para admins do sistema)
 */

// Middleware: Verifica se é domínio principal
router.use((req, res, next) => {
  if (!req.isMainDomain) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Tenant management is only available on the main domain',
    });
  }
  next();
});

// Middleware: Requer autenticação e role de admin
router.use(authMiddleware);
router.use(requireRole(['ADMIN']));

// Lista todos os tenants
router.get('/', 
  validatePagination, 
  (req, res) => tenantController.listTenants(req, res)
);

// Cria um novo tenant
router.post('/', 
  validateTenantCreate, 
  (req, res) => tenantController.createTenant(req, res)
);

// Obtém detalhes de um tenant específico
router.get('/:id', 
  validateUUID('id'), 
  (req, res) => tenantController.getTenant(req, res)
);

// Atualiza um tenant
router.patch('/:id', 
  validateUUID('id'), 
  (req, res) => tenantController.updateTenant(req, res)
);

// Ativa/desativa um tenant
router.patch('/:id/status', 
  validateUUID('id'), 
  (req, res) => tenantController.toggleTenantStatus(req, res)
);

// Obtém estatísticas do tenant
router.get('/:id/statistics', 
  validateUUID('id'), 
  (req, res) => tenantController.getTenantStatistics(req, res)
);

// Verifica disponibilidade de subdomínio
router.post('/check-subdomain', 
  (req, res) => tenantController.checkSubdomainAvailability(req, res)
);

module.exports = router;