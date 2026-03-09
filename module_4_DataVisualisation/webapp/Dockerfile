FROM node:18-alpine

WORKDIR /app

COPY observable/package.json observable/package-lock.json* ./observable/
WORKDIR /app/observable
RUN npm install

COPY observable ./

EXPOSE 3002

CMD ["node","./docker-entry.mjs"]
