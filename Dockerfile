# Build stage
FROM node:22-alpine AS build-stage

WORKDIR /app

COPY package*.json ./

# Install dependencies including devDependencies for build
RUN npm ci

COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:stable-alpine AS production-stage

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]