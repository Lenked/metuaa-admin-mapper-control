FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

# Installation des dépendances
RUN npm install --legacy-peer-deps

# Copie du fichier .env AVANT le build
COPY .env .env

# Copie du code source
COPY . .

# Build du projet
RUN npm run build

FROM nginx:alpine AS prod

# Copie de la config nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie du build généré par Vite
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]