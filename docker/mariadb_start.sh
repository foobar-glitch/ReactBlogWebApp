docker run -p 127.0.0.1:33060:3306  --name mariadbserver -e MARIADB_ROOT_PASSWORD=root -d mariadb:11.5.2

docker build -f docker/httpd_server_file -t httpd_server .
docker run -d --name my-httpd -p 2a02:908:e845:3560::8070:443:443 httpd_server
# mariadb  -h 127.0.0.1 --port 33060 -u root -p
# docker rm -v $(docker ps --filter status=exited -q)