FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable \
  && pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

EXPOSE 4000

CMD ["node", "dist/main.js"] 