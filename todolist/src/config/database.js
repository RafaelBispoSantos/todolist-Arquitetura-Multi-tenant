// src/config/database.js

const { PrismaClient } = require('@prisma/client');
const config = require('./environment');

let prisma;

/**
 * Configura o Prisma Client com as opções apropriadas
 * @returns {PrismaClient} Instância do Prisma Client
 */
const createPrismaClient = () => {
  if (prisma) {
    return prisma;
  }

  prisma = new PrismaClient({
    log: config.nodeEnv === 'development' 
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
    errorFormat: config.nodeEnv === 'development' ? 'pretty' : 'minimal',
  });

  // Adiciona evento de log para debug em desenvolvimento
  if (config.nodeEnv === 'development') {
    prisma.$on('query', (e) => {
      console.log('Query: ' + e.query);
      console.log('Params: ' + e.params);
      console.log('Duration: ' + e.duration + 'ms');
    });
  }

  return prisma;
};

/**
 * Conecta ao banco de dados
 * @returns {Promise} Promise de conexão
 */
const connectDatabase = async () => {
  try {
    const prismaClient = createPrismaClient();
    await prismaClient.$connect();
    console.log('Database connected successfully');
    return prismaClient;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

/**
 * Desconecta do banco de dados
 * @returns {Promise} Promise de desconexão
 */
const disconnectDatabase = async () => {
  if (prisma) {
    await prisma.$disconnect();
    console.log('Database disconnected successfully');
  }
};

module.exports = {
  createPrismaClient,
  connectDatabase,
  disconnectDatabase,
};