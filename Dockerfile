# Repository of source code
ARG SOURCE="https://github.com/adambarath/nextjs-starter-medusa.git"
# Branch name
ARG BRANCH="i18n"

# 1. Install dependencies only when needed
FROM node:18-alpine as base

WORKDIR /app/medusa

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn install; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i; \
  else echo "Lockfile not found." && exit 1; \
  fi

RUN npm install -g @medusajs/medusa-cli@latest

RUN echo ----------------------------------------------------------------
# RUN ls -a


# 2. Rebuild the source code only when needed
# ===== PRODUCTION BUILDER STAGE =====
FROM base AS builder
ENV NODE_ENV=production

WORKDIR /app/medusa
COPY --from=base /app/medusa/node_modules ./node_modules
COPY . .
# This will do the trick, use the corresponding env file for each environment.
# COPY .env.production.sample .env.production

RUN npm run build



# 3. Production image, copy all the files and run next
# ===== PRODUCTION RUNNER STAGE =====
FROM node:18-alpine as prod
ENV NODE_ENV=production

WORKDIR /app/medusa
RUN mkdir dist

#COPY develop.sh .
#CMD [ "./app/medusa/develop.sh", ]

COPY package*.json .
COPY medusa-config.js .

#COPY --from=builder /app/medusa/dist ./dist
COPY dist ./dist

# RUN npm i --only=production
RUN npm install -g @medusajs/medusa-cli@latest

RUN ls -a

EXPOSE 9000
EXPOSE 7000
CMD ["medusa", "start" ]
