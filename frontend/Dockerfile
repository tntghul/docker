# --- STAGE 1: React Code Build karna ---
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# --- STAGE 2: Nginx Web Server par serve karna ---
FROM nginx:alpine

# Stage 1 se dist folder ko Nginx ke public folder mein copy karein
COPY --from=build /app/dist /usr/share/nginx/html

# Custom nginx config copy karein
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Web standard HTTP port
EXPOSE 80

# Nginx ko background mein nahi, active chalayein
CMD ["nginx", "-g", "daemon off;"]