# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN --mount=type=cache,target=/root/.npm     npm ci || yarn install --frozen-lockfile || pnpm i --frozen-lockfile
COPY . .
RUN npm run build || yarn build || pnpm build

# Run stage
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app .
EXPOSE 3000
CMD [ "npm", "start" ]
