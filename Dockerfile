# waehlt image auf dem Aufgebaut werden soll
FROM nginx:1.18 
ADD dist/Coyote48 /usr/share/nginx/html
ADD nginx.conf /etc/nginx/conf.d/default.conf
