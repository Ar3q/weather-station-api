FROM node:10-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install pm2 -g

RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD npm run start-pm