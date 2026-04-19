# Use lightweight Node 22 image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files for better caching
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy application source code
COPY . .

# Inform Docker that the app listens on port 5000
EXPOSE 5000

# Start the application
CMD ["node", "index.js"]
