FROM node:20 as base

LABEL maintainer="Florian Raith"

# https://github.com/puppeteer/puppeteer/blob/main/docker/Dockerfile
RUN apt-get update \
#    && apt-get install -y wget gnupg \
#    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
#    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
#    && apt-get update \
    && apt-get install -y chromium fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends
#    && rm -rf /var/lib/apt/lists/* \

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium

WORKDIR /home/www/backend

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM base as development

ENV NODE_ENV=development

EXPOSE 9222
EXPOSE 3000

CMD ["npm", "run", "start:dev"]

FROM base as production

ENV NODE_ENV=production

ENV PORT=80

EXPOSE 80

CMD ["npm", "run", "start:prod"]
