FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm i -g nodemon && npm install
COPY . .
RUN npm run build
EXPOSE 5001
CMD ["nodemon", "--exec", "ts-node", "src/server.ts"]