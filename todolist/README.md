# TodoList Backend Multi-tenant

Backend para aplicativo TodoList com arquitetura multi-tenant usando subdomínios, Node.js, Express, PostgreSQL e Prisma.

## 🚀 Características

- Arquitetura multi-tenant com subdomínios
- Autenticação JWT com isolamento por tenant
- Banco de dados PostgreSQL com Prisma ORM
- Filtro automático de dados por tenant
- API RESTful com documentação
- Middleware de segurança (Helmet, CORS, Rate Limiting)
- Arquitetura limpa com separação de camadas

## 📋 Pré-requisitos

- Node.js (v14 ou superior)
- PostgreSQL (v12 ou superior)
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/todolist-backend.git
cd todolist-backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Execute as migrações do banco de dados:
```bash
npx prisma migrate dev
```

5. Inicie o servidor:
```bash
npm run dev
```

## 📚 Estrutura do Projeto

```
src/
├── config/           # Configurações da aplicação
├── middleware/       # Middlewares Express
├── routes/          # Definição de rotas
├── controllers/     # Lógica de controle HTTP
├── services/        # Lógica de negócio
├── repositories/    # Acesso ao banco de dados
├── utils/          # Utilitários e helpers
├── app.js          # Configuração do Express
└── server.js       # Inicialização do servidor
```

## 🔒 Arquitetura Multi-tenant

O sistema usa subdomínios para identificar diferentes tenants. Cada requisição é filtrada automaticamente pelo `tenantId` extraído do subdomínio.

### Fluxo de Requisição:
1. Requisição chega em `tenant1.todolist.com`
2. Middleware extrai `tenant1` do subdomínio
3. Busca o `tenantId` no banco de dados
4. Todas as operações são filtradas por esse `tenantId`

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registro de novo usuário
- `POST /api/auth/login` - Login de usuário

### Todos
- `GET /api/todos` - Lista todos os todos do usuário
- `POST /api/todos` - Cria um novo todo
- `GET /api/todos/:id` - Obtém um todo específico
- `PATCH /api/todos/:id` - Atualiza um todo
- `DELETE /api/todos/:id` - Remove um todo
- `PATCH /api/todos/:id/status` - Atualiza status do todo
- `GET /api/todos/upcoming` - Lista todos próximos ao vencimento
- `GET /api/todos/overdue` - Lista todos atrasados
- `GET /api/todos/statistics` - Obtém estatísticas do usuário

## 🛠️ Desenvolvimento

### Executar em modo desenvolvimento:
```bash
npm run dev
```

### Executar testes:
```bash
npm test
```

### Acessar Prisma Studio:
```bash
npm run prisma:studio
```

## 🔒 Segurança

- Todas as rotas são protegidas por autenticação JWT
- Dados são automaticamente filtrados por tenant
- Validação de entrada em todas as rotas
- Rate limiting para prevenir abuso
- Headers de segurança com Helmet

## 📝 Variáveis de Ambiente

- `NODE_ENV` - Ambiente (development/production)
- `PORT` - Porta do servidor
- `DATABASE_URL` - URL de conexão PostgreSQL
- `JWT_SECRET` - Chave secreta para tokens JWT
- `JWT_EXPIRES_IN` - Tempo de expiração do token
- `MAIN_DOMAIN` - Domínio principal da aplicação
- `PROTOCOL` - Protocolo (http/https)
- `CORS_ORIGIN` - Origens permitidas para CORS
- `BCRYPT_ROUNDS` - Rounds para hash de senha

## 🚀 Deployment

1. Configure variáveis de ambiente de produção
2. Execute as migrações no banco de produção
3. Configure DNS wildcard para subdomínios (*.todolist.com)
4. Configure certificado SSL wildcard
5. Use um process manager como PM2
6. Configure proxy reverso (Nginx/Apache)

## 📄 Licença

Este projeto está sob a licença ISC.