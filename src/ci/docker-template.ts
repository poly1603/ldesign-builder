/**
 * Docker 集成模板
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

/**
 * 生成 Dockerfile
 */
export function generateDockerfile(options: {
  nodeVersion?: string
  packageManager?: 'npm' | 'pnpm' | 'yarn'
  buildCommand?: string
}): string {
  const opts = {
    nodeVersion: options.nodeVersion || '20-alpine',
    packageManager: options.packageManager || 'pnpm',
    buildCommand: options.buildCommand || 'build'
  }

  const installCmd = opts.packageManager === 'pnpm'
    ? 'pnpm install --frozen-lockfile'
    : opts.packageManager === 'yarn'
      ? 'yarn install --frozen-lockfile'
      : 'npm ci'

  const buildCmd = opts.packageManager === 'pnpm'
    ? `pnpm run ${opts.buildCommand}`
    : opts.packageManager === 'yarn'
      ? `yarn ${opts.buildCommand}`
      : `npm run ${opts.buildCommand}`

  return `# Build stage
FROM node:${opts.nodeVersion} AS builder

# Install pnpm if needed
${opts.packageManager === 'pnpm' ? 'RUN npm install -g pnpm@8' : ''}

WORKDIR /app

# Copy package files
COPY package.json ${opts.packageManager === 'pnpm' ? 'pnpm-lock.yaml' : opts.packageManager === 'yarn' ? 'yarn.lock' : 'package-lock.json'} ./

# Install dependencies
RUN ${installCmd}

# Copy source code
COPY . .

# Build
RUN ${buildCmd}

# Production stage
FROM node:${opts.nodeVersion}

WORKDIR /app

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/es ./es
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/package.json ./

# Install production dependencies only
${opts.packageManager === 'pnpm' ? 'RUN npm install -g pnpm@8' : ''}
RUN ${opts.packageManager === 'pnpm' ? 'pnpm install --prod --frozen-lockfile' : opts.packageManager === 'yarn' ? 'yarn install --production --frozen-lockfile' : 'npm ci --only=production'}

CMD ["node", "dist/index.js"]
`
}

/**
 * 生成 docker-compose.yml
 */
export function generateDockerCompose(options: {
  serviceName?: string
  port?: number
}): string {
  const opts = {
    serviceName: options.serviceName || 'builder',
    port: options.port || 3000
  }

  return `version: '3.8'

services:
  ${opts.serviceName}:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "${opts.port}:${opts.port}"
    environment:
      - NODE_ENV=production
    volumes:
      - ./dist:/app/dist:ro
      - ./es:/app/es:ro
      - ./lib:/app/lib:ro
    restart: unless-stopped
`
}

/**
 * 生成 .dockerignore
 */
export function generateDockerIgnore(): string {
  return `node_modules
dist
es
lib
*.log
.git
.gitignore
.env
.env.local
.DS_Store
coverage
.vscode
.idea
*.test.ts
*.spec.ts
__tests__
.github
docs
examples
`
}


