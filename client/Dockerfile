# Stage 1: Build the React application
FROM node:22-alpine AS build-stage

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (required for building)
RUN npm install

# Copy source code
COPY . .

# Build the production bundle
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:stable-alpine

# Copy custom Nginx configuration to support React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output from Stage 1 to Nginx's serving directory
COPY --from=build-stage /app/build /usr/share/nginx/html

# Inform Docker that Nginx listens on port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
