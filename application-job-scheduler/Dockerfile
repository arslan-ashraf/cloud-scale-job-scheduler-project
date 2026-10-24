# Secure and small base image
FROM node:26-alpine3.23 AS base
WORKDIR /app
ENV NODE_ENV=production

# Separate target container for running the Mocha suite in a container.
FROM node:26-alpine3.23 AS test
WORKDIR /app
ENV NODE_ENV=test
COPY package.json ./
RUN npm install --no-audit --no-fund && npm cache clean --force
COPY . .
CMD ["npm", "test"]

# Install only runtime dependencies in the production image.
FROM base AS production-deps
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund \
    && npm cache clean --force

FROM base AS runtime
ENV NODE_ENV=production PORT=3000
COPY --from=production-deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json app.js ./
COPY --chown=node:node views ./views
COPY --chown=node:node public ./public
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "app.js"]
