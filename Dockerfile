FROM node:alpine

WORKDIR /app 

# Copier le package.json depuis le répertoire back
COPY package*.json ./
RUN npm install

# Copier tous les fichiers du back
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
