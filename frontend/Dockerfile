# Multi-stage build for React + Vite with Nginx
# Optimized for caching and minimal runtime size

# Stage 1: Build (Node.js)
FROM node:20-alpine AS builder
WORKDIR /app
ARG VITE_API_URL=http://localhost:8080

# Layer 1: Dependencies (highest cache priority)
COPY package*.json ./
RUN npm ci --omit=dev

# Layer 2: Source code
COPY . .
RUN printf "VITE_API_URL=%s\n" "$VITE_API_URL" > .env.production
RUN npm run build

# Stage 2: Runtime (Nginx)
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html

# Copy built app
COPY --from=builder /app/dist .

# Copy optimized nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Security: add non-root user (nginx already runs as daemon, but explicit is clearer)
RUN addgroup -g 101 nginx-user && adduser -D -u 101 -G nginx-user nginx-user || true

EXPOSE 80

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget -q --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
