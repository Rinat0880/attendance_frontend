# Build stage
FROM node:18.18.2-alpine AS build

RUN mkdir /app

WORKDIR /app

COPY package*.json ./

RUN npm install

ENV CI=false

COPY . . 

RUN ls -al /app/src

RUN npm run build

# Production stage
FROM nginx:1.21.6-alpine AS production-stage

COPY --from=build /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
