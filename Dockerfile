# Use Node 22/24 slim bookworm base
FROM node:22-bookworm-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    gnupg \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first for Docker caching
COPY package*.json ./
RUN npm install

# Copy application source
COPY . .

# Build TypeScript to dist
RUN npm run build

# Expose Render default port
EXPOSE 10000

ENV PORT=10000
ENV NODE_ENV=production

# Start CouchScout server
CMD ["npm", "start"]
