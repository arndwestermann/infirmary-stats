FROM node:20.15.0-alpine3.20 as build
WORKDIR /app
COPY . .
RUN npm ci
RUN npx nx run client:build

FROM nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/apps/client/browser /usr/share/nginx/html
