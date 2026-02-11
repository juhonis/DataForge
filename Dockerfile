# Use Node 20
FROM node:20-alpine

WORKDIR /app

# Copy package files from application folder
COPY application/package*.json ./

RUN npm install

COPY application/ .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]