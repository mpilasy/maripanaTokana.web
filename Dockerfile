# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app

# Copy all package files
COPY package.json package-lock.json ./
COPY react/package.json react/package-lock.json ./react/
COPY angular/package.json angular/package-lock.json ./angular/

# Install root dependencies (Svelte)
RUN npm ci

# Install React dependencies
WORKDIR /app/react
RUN npm ci

# Install Angular dependencies
WORKDIR /app/angular
RUN npm ci

# Copy source code
WORKDIR /app
COPY . .

# Build all three apps
RUN npm run build
RUN cd react && npm run build
RUN cd angular && npm run build

# Stage 2: Serve
FROM caddy:alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/build /srv/svelte
COPY --from=build /app/react/dist /srv/re
COPY --from=build /app/angular/dist /srv/an
EXPOSE 80
