# 1. Base Image: Ek chhota Linux OS jisme Node.js 20 pehle se installed ho
FROM node:20-alpine

# 2. Container ke andar '/app' naam ka working folder banayein
WORKDIR /app

# 3. Pehle sirf package.json aur package-lock.json copy karein
COPY package*.json ./

# 4. Container ke andar saare node_modules install karein
RUN npm install

# 5. Ab apna baaki saara code (server.js, routes, config) copy karein
COPY . .

# 6. Port 3000 open karein
EXPOSE 3000

# 7. Jab container run ho, tab server ko start karein
CMD ["node", "server.js"]