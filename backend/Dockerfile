# Use Node.js 20 alpine as the base image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --quiet --no-audit --prefer-offline

# Copy the rest of the backend source code
COPY . .

# Create uploads directory if it doesn't exist
RUN mkdir -p uploads

# Expose the port the backend runs on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
