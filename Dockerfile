FROM node:20 as base

LABEL maintainer="Florian Raith"

WORKDIR /usr/src/app/backend

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM base as development

ENV NODE_ENV=development

EXPOSE 3000

CMD ["npm", "run", "start:dev"]

FROM base as production

ENV NODE_ENV=production

ENV PORT=80

EXPOSE 80

CMD ["npm", "run", "start:prod"]