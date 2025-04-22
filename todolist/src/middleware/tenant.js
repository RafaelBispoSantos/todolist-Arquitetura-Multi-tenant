// src/middleware/tenant.js

const { PrismaClient } = require('@prisma/client');
const config = require('../config/environment');
const { TenantNotFoundError } = require('../utils/errors');

const prisma = new PrismaClient();

/**
 * Middleware para identificação do tenant através do subdomínio
 * Extrai o subdomínio da requisição e busca o tenant correspondente
 * Anexa o tenantId ao objeto request para uso posterior
 * 
 * @param {Request} req - Objeto de requisição Express
 * @param {Response} res - Objeto de resposta Express
 * @param {NextFunction} next - Função para continuar o fluxo
 */
const tenantMiddleware = async (req, res, next) => {
  try {
    // Obtém o hostname completo da requisição
    const hostname = req.hostname;
    
    // Verifica se está acessando o domínio principal (área administrativa ou landing page)
    if (hostname === config.domain.main || hostname.includes('localhost')) {
      // No ambiente de desenvolvimento, ainda precisamos de um tenant para operações como registro
      // Primeiro, verifica se existe um tenant marcado como padrão
      if (config.nodeEnv === 'development') {
        try {
          const defaultTenant = await prisma.tenant.findFirst({
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              subdomain: true,
              primaryColor: true,
              logoUrl: true,
            },
            orderBy: { createdAt: 'asc' },
          });

          if (defaultTenant) {
            // Usa o primeiro tenant encontrado para desenvolvimento
            req.tenant = defaultTenant;
            req.tenantId = defaultTenant.id;
            req.isMainDomain = true;
            console.log(`Development mode: Using default tenant: ${defaultTenant.name} (${defaultTenant.id})`);
            return next();
          }
        } catch (err) {
          console.log('No default tenant found, proceeding with standard flow');
        }
      }
      
      // Para rotas do domínio principal, marcamos como principal
      req.isMainDomain = true;
      return next();
    }
    
    // Extrai o subdomínio do hostname
    // Exemplo: barbearia.meuapp.com → barbearia
    const subdomain = hostname.split('.')[0];
    
    // Busca o tenant no banco de dados pelo subdomínio
    const tenant = await prisma.tenant.findUnique({
      where: {
        subdomain: subdomain,
        isActive: true, // Verifica se o tenant está ativo
      },
      select: {
        id: true,
        name: true,
        subdomain: true,
        primaryColor: true,
        logoUrl: true,
      },
    });
    
    // Se o tenant não for encontrado, lança erro
    if (!tenant) {
      throw new TenantNotFoundError(`Tenant with subdomain '${subdomain}' not found`);
    }
    
    // Anexa as informações do tenant à requisição
    req.tenant = tenant;
    req.tenantId = tenant.id;
    req.isMainDomain = false;
    
    // Debug log em ambiente de desenvolvimento
    if (config.nodeEnv === 'development') {
      console.log(`Tenant identified: ${tenant.name} (${tenant.id})`);
    }
    
    next();
  } catch (error) {
    // Em caso de erro específico de tenant não encontrado
    if (error instanceof TenantNotFoundError) {
      return res.status(404).json({
        error: 'Tenant not found',
        message: error.message,
      });
    }
    
    // Para outros erros, retorna erro 500
    console.error('Tenant middleware error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to identify tenant',
    });
  }
};

/**
 * Middleware para garantir que a requisição está associada a um tenant
 * Deve ser usado em rotas que requerem um tenant específico
 * 
 * @param {Request} req - Objeto de requisição Express
 * @param {Response} res - Objeto de resposta Express
 * @param {NextFunction} next - Função para continuar o fluxo
 */
const requireTenant = (req, res, next) => {
  if (!req.tenantId) {
    // Para ambiente de desenvolvimento, tenta usar um tenant padrão
    if (config.nodeEnv === 'development' && req.path.includes('/auth/register')) {
      console.log('Development mode: Bypassing tenant requirement for registration');
      return next();
    }
    
    return res.status(403).json({
      error: 'Tenant required',
      message: 'This operation requires a valid tenant context',
    });
  }
  next();
};

module.exports = {
  tenantMiddleware,
  requireTenant,
};