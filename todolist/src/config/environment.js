// src/config/environment.js

require('dotenv').config();

/**
 * Configurações de ambiente da aplicação
 * Carrega variáveis de ambiente e valida configurações obrigatórias
 */
const config = {
  // Configurações do servidor
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Configurações do banco de dados
  database: {
    url: process.env.DATABASE_URL,
  },
  
  // Configurações de JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  
  // Configurações do domínio principal e subdomínios
  domain: {
    main: process.env.MAIN_DOMAIN || 'localhost:3000',
    protocol: process.env.PROTOCOL || 'http',
  },
  
  // Configurações de CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
  
  // Configurações de segurança
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
  },
};

/**
 * Valida se todas as configurações obrigatórias estão presentes
 * @throws {Error} Se alguma configuração obrigatória estiver faltando
 */
const validateConfig = () => {
  const requiredConfigs = [
    'database.url',
    'jwt.secret',
  ];
  
  for (const path of requiredConfigs) {
    const keys = path.split('.');
    let value = config;
    
    for (const key of keys) {
      value = value[key];
      if (value === undefined) {
        throw new Error(`Missing required configuration: ${path}`);
      }
    }
  }
};

// Executa a validação ao carregar o módulo
validateConfig();

module.exports = config;