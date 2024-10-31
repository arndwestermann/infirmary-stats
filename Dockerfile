FROM nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY dist/apps/client/browser /usr/share/nginx/html
