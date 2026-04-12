# Stage 1: Build (This is where the heavy work happens)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
# Clean install to save temporary space
RUN npm ci --quiet --no-audit
COPY . .
RUN npm run build

# Stage 2: Serve (This throws away the 1GB+ of Node stuff and keeps ~20MB)
FROM nginx:alpine
# Check if your build folder is called 'dist' or 'build' and adjust below
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
