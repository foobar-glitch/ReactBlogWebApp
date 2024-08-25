docker run -p 127.0.0.1:33060:3306  --name mariadbserver -e MARIADB_ROOT_PASSWORD=root -d mariadb:11.5.2

docker build -f docker/httpd_server_file -t httpd_server .
docker run -d --name my-httpd -p 2a02:908:e845:3560::8070:443:443 httpd_server

docker build -f docker/node_backend_server_file -t nodejs_server .
docker run --rm -v /var/www/private/nodejs/:/var/www/private/nodejs/ --name my-nodejs nodejs_server
#docker run -d --entrypoint "/bin/sh" -v /var/www/private/nodejs/:/var/www/private/nodejs/ --name my-nodejs nodejs_server 
#docker run -d -it --entrypoint /bin/sh --name my-nodejs -v /var/www/private/nodejs/:/var/www/private/nodejs/ nodejs_server
# mariadb  -h 127.0.0.1 --port 3306 -u root -p
# docker rm -v $(docker ps --filter status=exited -q)