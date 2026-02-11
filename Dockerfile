# Use Node 20
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Vite default port
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]