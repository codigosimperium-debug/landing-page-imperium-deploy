FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json knexfile.cjs ./
COPY migrations ./migrations
COPY src ./src

RUN npm run build

EXPOSE 4000

CMD ["sh", "-c", "npm run migrate && npm run start"]
