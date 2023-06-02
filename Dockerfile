FROM node:18

LABEL maintainer="Florian Raith"

WORKDIR /usr/src/app/backend

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173