# Builder
FROM node:16 as builder

ARG PUBLIC_URL=/
ARG REACT_APP_SERVER

WORKDIR /src

COPY . /src
RUN npm install
ENV NODE_OPTIONS="--openssl-legacy-provider"
RUN PUBLIC_URL=$PUBLIC_URL REACT_APP_SERVER=$REACT_APP_SERVER npm run build

# App
FROM nginx:alpine

COPY --from=builder /src/build /app

RUN rm -rf /usr/share/nginx/html \
 && ln -s /app /usr/share/nginx/html
