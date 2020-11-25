# APP
FROM node:12

RUN mkdir /app
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY ../src ./

ENTRYPOINT ["npm", "run", "start"]
