FROM node:22-alpine

WORKDIR /app

# Copier package.json et installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le reste du code
COPY . .

# Exposer le port
EXPOSE 3000

# Démarrer l'app en mode développement
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]