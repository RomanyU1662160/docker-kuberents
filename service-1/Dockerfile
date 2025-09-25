FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm i -g nodemon && npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["nodemon", "--exec", "ts-node", "src/server.ts"]