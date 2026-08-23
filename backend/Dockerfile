# ------------------------------------
# Stage 1: Builder
# ------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install ALL dependencies (including dev dependencies required for TypeScript build)
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the TypeScript project into the /dist folder
RUN npm run build

# ------------------------------------
# Stage 2: Production
# ------------------------------------
FROM node:20-alpine

# Set the environment variable for production optimizations
ENV NODE_ENV=production

# Switch to the secure, non-root 'node' user provided by the alpine image
USER node
WORKDIR /app

# Copy package files and ensure correct ownership
COPY --chown=node:node package*.json ./

# Install ONLY production dependencies, ignoring all devDependencies
RUN npm install --omit=dev

# Copy the compiled output from the builder stage
COPY --from=builder --chown=node:node /app/dist ./dist

# Expose the backend API port
EXPOSE 4000

# Add a healthcheck so orchestrators know if the app is actually responding
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Start the application using 'node' directly rather than 'npm start'
# This reduces memory overhead and improves signal handling (SIGTERM)
CMD ["node", "dist/app.js"]
