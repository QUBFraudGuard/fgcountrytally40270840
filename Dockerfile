# Country-tally service — counts transactions by country.
# Built and run as an individual container (no docker-compose).
FROM node:20-alpine
WORKDIR /app

# Install dependencies first so this layer caches across code changes.
COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 8071

# app.js starts the web server on 0.0.0.0:8071.
CMD ["node", "app.js"]
