# Use official Node.js runtime as base image
FROM node:18-alpine
# Set working directory inside container
WORKDIR src
# Copy package files first (for better caching)
COPY package*.json ./
# Install dependencies
RUN npm ci --only=production
# Copy application code
COPY . .
# Expose the port your app runs on
EXPOSE 3000
# Define the command to run your app
CMD ["node", "server.js"]