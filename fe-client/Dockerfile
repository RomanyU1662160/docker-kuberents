FROM node:20-alpine
ENV CI=true
ENV WDS_SOCKET_PORT=0
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]
# look into vite.config file for more details about the port and host listening to 0.0.0.0