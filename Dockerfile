FROM node:20

WORKDIR /usr/src/app
COPY . .
RUN npm install --production
ENV KAFKA_HOST=kafka
ENV KAFKA_PORT=29092

CMD ["npm", "start"]