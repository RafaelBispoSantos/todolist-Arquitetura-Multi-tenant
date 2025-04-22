// src/server.js

const app = require('./app');
const config = require('./config/environment');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Inicializa o servidor Express
 */
const startServer = async () => {
  try {
    // Testa a conexão com o banco de dados
    await prisma.$connect();
    console.log('✅ Database connection established');
    
    // Inicia o servidor
    const port = config.port;
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Domain: ${config.domain.protocol}://${config.domain.main}`);
    });
    
    // Tratamento de encerramento gracioso
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Função para encerramento gracioso do servidor
 * @param {string} signal - Sinal recebido (SIGTERM, SIGINT)
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  try {
    // Fecha a conexão com o banco de dados
    await prisma.$disconnect();
    console.log('✅ Database connection closed');
    
    // Encerra o processo
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Inicia o servidor
startServer();