// create-admin.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdminAndTenant() {
  try {
    // Cria o tenant principal
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Admin Tenant',
        subdomain: 'admin',
        primaryColor: '#3b82f6',
        isActive: true
      },
    });
    
    // Cria o usuário admin
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    const user = await prisma.user.create({
      data: {
        email: 'admin@todolist.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
        tenantId: tenant.id,
      },
    });
    
    console.log('Admin user e tenant criados com sucesso:', { tenant, user });
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminAndTenant();