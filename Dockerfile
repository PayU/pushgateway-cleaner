# APP
FROM node:12

RUN mkdir /app
WORKDIR /app

COPY package*.json ./
RUN npm install

RUN mkdir /src
COPY src/ src/

CMD [ "npm", "run", "start" ]