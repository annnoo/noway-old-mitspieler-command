
FROM node:12.19.0-alpine3.9 as production
WORKDIR /usr/src/app





COPY . .
RUN npm install glob rimraf

RUN npm install
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
RUN npm run build


CMD ["node", "dist/main"]