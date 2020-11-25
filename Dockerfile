# APP
FROM node:12

RUN mkdir /src
WORKDIR /src

COPY package*.json ./
RUN npm install
COPY src/ src/

ENTRYPOINT ["npm", "run", "start"]
