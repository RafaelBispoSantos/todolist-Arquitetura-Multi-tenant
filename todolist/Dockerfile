# Use imagem Debian em vez de Alpine
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN apt-get update && apt-get install -y openssl && apt-get clean
RUN npm ci

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy all files
COPY . .

# Expose port
EXPOSE 3000

# Iniciar com detecção de erros mais detalhada
CMD ["bash", "-c", "DEBUG=* npm run dev"]