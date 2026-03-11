FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# We will run prisma push and seed on startup, so we need tsx and a script
# Alternatively we can just use the start script.
ENV PORT=8080
ENV DATABASE_URL="file:./dev.db"

EXPOSE 8080

CMD npm run db:push && npm run db:seed && npm start
