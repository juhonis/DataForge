FROM node:22-alpine

WORKDIR /app

# 1. Copy package files first
COPY application/package*.json ./

# 2. Install dependencies
RUN npm install

# 3. Copy everything else from application/
COPY application/ .

EXPOSE 5173

# Use --host to expose to Docker, and --clearScreen false to see all logs
CMD ["npm", "run", "dev", "--", "--host", "--clearScreen", "false"]