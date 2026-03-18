FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

ENV PORT=8080

# Run as non-root user for security
USER node

EXPOSE 8080

CMD npx prisma migrate deploy && npm run db:seed && npm start
