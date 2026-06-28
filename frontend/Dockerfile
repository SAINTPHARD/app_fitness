# build stage
FROM node:20-alpine AS builder
WORKDIR /app
ARG VITE_API_URL=http://localhost:8080
COPY package*.json ./
RUN npm install
COPY . .
RUN printf "VITE_API_URL=%s\n" "$VITE_API_URL" > .env.production
RUN npm run build

# production stage
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
