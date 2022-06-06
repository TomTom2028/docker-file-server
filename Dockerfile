FROM node:16.14.0-alpine as builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci


FROM node:16.14.0-alpine
WORKDIR /app
COPY --from=builder /app/node_modules/ ./node_modules
COPY . .
EXPOSE 80
ENV whitelist='image/png image/jpeg image/jpg image/webp'
CMD ["node", "index.js"]
