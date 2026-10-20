FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY ["Masahiro OEE.html", "/usr/share/nginx/html/index.html"]
COPY tweaks-panel.jsx /usr/share/nginx/html/tweaks-panel.jsx
COPY app /usr/share/nginx/html/app
