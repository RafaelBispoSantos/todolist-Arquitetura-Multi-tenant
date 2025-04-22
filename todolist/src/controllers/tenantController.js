// src/controllers/tenantController.js

const tenantService = require('../services/tenantService');
const { ValidationError, NotFoundError, ConflictError } = require('../utils/errors');

/**
 * Controller de Tenant
 * Gerencia requisições de administração de tenants
 */
class TenantController {
  /**
   * Lista todos os tenants
   * GET /api/tenants
   */
  async listTenants(req, res) {
    try {
      const { page = 1, pageSize = 10, search, isActive } = req.query;
      
      const result = await tenantService.listTenants({
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        search,
        isActive: isActive === 'true',
      });
      
      res.json({
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  /**
   * Cria um novo tenant
   * POST /api/tenants
   */
  async createTenant(req, res) {
    try {
      const { name, subdomain, primaryColor, logoUrl } = req.body;
      
      const tenant = await tenantService.createTenant({
        name,
        subdomain,
        primaryColor,
        logoUrl,
      });
      
      res.status(201).json({
        message: 'Tenant created successfully',
        data: tenant,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  /**
   * Obtém detalhes de um tenant específico
   * GET /api/tenants/:id
   */
  async getTenant(req, res) {
    try {
      const { id } = req.params;
      
      const tenant = await tenantService.getTenantById(id);
      
      res.json({
        data: tenant,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  /**
   * Atualiza um tenant
   * PATCH /api/tenants/:id
   */
  async updateTenant(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const tenant = await tenantService.updateTenant(id, updateData);
      
      res.json({
        message: 'Tenant updated successfully',
        data: tenant,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  /**
   * Ativa/desativa um tenant
   * PATCH /api/tenants/:id/status
   */
  async toggleTenantStatus(req, res) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      if (typeof isActive !== 'boolean') {
        throw new ValidationError('isActive must be a boolean');
      }
      
      const tenant = await tenantService.updateTenantStatus(id, isActive);
      
      res.json({
        message: `Tenant ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: tenant,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  /**
   * Obtém estatísticas do tenant
   * GET /api/tenants/:id/statistics
   */
  async getTenantStatistics(req, res) {
    try {
      const { id } = req.params;
      
      const statistics = await tenantService.getTenantStatistics(id);
      
      res.json({
        data: statistics,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  /**
   * Verifica disponibilidade de subdomínio
   * POST /api/tenants/check-subdomain
   */
  async checkSubdomainAvailability(req, res) {
    try {
      const { subdomain } = req.body;
      
      if (!subdomain) {
        throw new ValidationError('Subdomain is required');
      }
      
      const isAvailable = await tenantService.checkSubdomainAvailability(subdomain);
      
      res.json({
        available: isAvailable,
        message: isAvailable ? 'Subdomain is available' : 'Subdomain is already taken',
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
    console.error('Tenant controller error:', error);
    
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
    
    if (error instanceof ConflictError) {
      return res.status(409).json({
        error: 'Conflict',
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

module.exports = new TenantController();