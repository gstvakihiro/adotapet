# Imagem do frontend (React + Vite) para desenvolvimento.
FROM node:22-alpine

WORKDIR /app

# Instala as dependências primeiro, para o Docker reaproveitar essa camada
# quando só o código mudar. "npm ci" usa exatamente as versões do package-lock.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173

# Servidor de desenvolvimento do Vite (recarrega a página ao salvar).
CMD ["npm", "run", "dev"]
