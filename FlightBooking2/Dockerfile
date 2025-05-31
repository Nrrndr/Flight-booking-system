# Use official Node.js runtime as base image
FROM node:18-alpine
# Set working directory inside container
WORKDIR src
# Copy package files first (for better caching)

RUN apk add --no-cache curl

COPY package*.json ./
# Install dependencies
# RUN npm ci --only=production
RUN npm install
# Copy application code
COPY . .

# RUN addgroup -g 1001 -S nodejs
# RUN adduser -S ejs -u 1001
# USER ejs
RUN adduser --disabled-password --gecos "" appuser
USER appuser

# Expose the port your app runs on
EXPOSE 3000
# Define the command to run your app
CMD ["npm", "start"]