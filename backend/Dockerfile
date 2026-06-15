# Cambia de node:18-alpine a node:20-alpine
FROM node:20-alpine

WORKDIR /app

# Instalar dependencias del sistema necesarias para algunas librerías de Node
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Compilar
RUN npm run build

# Limpiar las dependencias de desarrollo para aligerar la imagen
RUN npm prune --production

EXPOSE 3000

CMD ["node", "dist/main"]