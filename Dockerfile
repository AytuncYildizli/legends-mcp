FROM node:22.23.4-slim@sha256:de170b39439eb0e5a3444ad7d60b015614a381e10fecae2e30ec9e735122f38d

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built files and legends data
COPY dist/ ./dist/
COPY legends/ ./legends/

# Set entrypoint
ENTRYPOINT ["node", "dist/index.js"]
