# pass-through Arguments in every stage. See: https://benkyriakou.com/posts/docker-args-empty

# Repository of source code
ARG SOURCE="https://github.com/adambarath/medusa-backend.git"
# Branch name
ARG BRANCH="medusajs-v2"


# Rebuild the source code only when needed
# ===== PRODUCTION BUILDER STAGE =====
FROM node:20-alpine AS builder
ARG BRANCH
ARG SOURCE

# If NODE_ENV is set to production the cookie is secure. Hence it needs SSL certificate.
# https://github.com/medusajs/medusa/issues/2314#issuecomment-1422429232
# ENV NODE_ENV=development
ENV NODE_ENV=production

WORKDIR /app/medusa-src

RUN npm install -g @medusajs/medusa-cli@preview

RUN apk add --no-cache git && \
    git clone --depth 1 --branch ${BRANCH} ${SOURCE} /app/medusa-src

RUN yarn install && yarn build

# 3. Production image, copy all the files and run next
# ===== PRODUCTION RUNNER STAGE =====
FROM node:20-alpine as prod
EXPOSE 9000
ENV NODE_ENV=production

WORKDIR /app/medusa

COPY --from=builder --chmod=0755 /app/medusa-src/develop.sh .
#RUN chmod +x develop.sh
COPY --from=builder /app/medusa-src/package*.json .
COPY --from=builder /app/medusa-src/medusa-config.js .
COPY --from=builder /app/medusa-src/node_modules ./node_modules
COPY --from=builder /app/medusa-src/dist ./dist
COPY --from=builder /app/medusa-src/build ./build

RUN npm install --only=production
RUN npm install -g @medusajs/medusa-cli@preview

#COPY develop.sh .
#COPY package*.json .
#COPY medusa-config.js .
#RUN mkdir dist
#RUN mkdir build
#COPY dist ./dist
#COPY build ./build

ENTRYPOINT ["sh", "/app/medusa/docker-start.sh", "start"]