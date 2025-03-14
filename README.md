# The Blog React App

This is a simple react blog with login feature and adding and deleting blog entries

## Infomation Schemas

There are two SQL databases and one NOSQL database. The SQL databases are for login and session handling and the NOSQL database is for comment storage

### SQL Databases

#### Table users
This is the information Schema for the users (table name: 'users'):
```SQL
CREATE TABLE users (
    userId INT(11) NOT NULL AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (userId)
);
```


| Field      | Type         | Null | Key | Default             | Extra                         |
|------------|--------------|------|-----|---------------------|-------------------------------|
| userId     | int(11)      | NO   | PRI | NULL                | auto_increment                |
| username   | varchar(255) | NO   | UNI | NULL                |                               |
| password   | varchar(255) | NO   |     | NULL                |                               |
| salt       | varchar(255) | NO   |     | NULL                |                               |
| role       | varchar(255) | NO   |     | NULL                |                               |
| created_at | datetime     | NO   |     | current_timestamp() |                               |
| updated_at | datetime     | NO   |     | current_timestamp() | on update current_timestamp() |

#### Table cookie_data
This is the information Schema for the cookie/session handling (table name: cookie_data):

```SQL
CREATE TABLE cookie_table (
    cookieId INT(11) NOT NULL AUTO_INCREMENT,
    userId INT(11) NOT NULL,
    cookieData VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expired_at DATETIME NOT NULL,
    PRIMARY KEY (cookieId),
    FOREIGN KEY (userId) REFERENCES users(userId)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
```

| Field      | Type         | Null | Key | Default             | Extra          |
|------------|--------------|------|-----|---------------------|----------------|
| cookieId   | int(11)      | NO   | PRI | NULL                | auto_increment |
| userId     | int(11)      | NO   | MUL | NULL                |                |
| cookieData | varchar(255) | NO   |     | NULL                |                |
| created_at | datetime     | NO   |     | current_timestamp() |                |
| expired_at | datetime     | NO   |     | NULL                |                |

Considering that _6f7f4b9659cbfbe6_ is a salt and _author_ is the password, to create an entry execute the following command:
``` SQL
INSERT INTO users (userID, username, password, salt, role, created_at, updated_at) VALUES (3, 'author', SHA2(CONCAT('author','6f7f4b9659cbfbe6'), 256), '6f7f4b9659cbfbe6', 'author', NOW(), NOW());
```

#### Table reset_table

``` SQL
CREATE TABLE reset_table (
    resetId INT(11) NOT NULL AUTO_INCREMENT,
    userId INT(11) NOT NULL,
    resetToken VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expired_at DATETIME NOT NULL,
    PRIMARY KEY (resetId),
    FOREIGN KEY (userId) REFERENCES users(userId)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

```



| Field       | Type         | Null | Key | Default             | Extra          |
|-------------|--------------|------|-----|---------------------|----------------|
| resetId     | int(11)      | NO   | PRI | NULL                | auto_increment |
| userId      | int(11)      | NO   | MUL | NULL                |                |
| resetToken  | varchar(255) | NO   |     | NULL                |                |
| created_at  | datetime     | NO   |     | current_timestamp() |                |
| expired_at  | datetime     | NO   |     | NULL                |                |

### NOSQL Database
This is how the blog entires are stored as of now:
``` json
[
  {
    "_id": "ObjectId('65905af3ed63023495b73103')",
    "createdAt": "Sat, 30 Dec 2023 18:01:23 GMT",
    "title": "Another blog",
    "body": "adding something new",
    "author": "admin",
    "id": 3,
    "commtents": [
      {"username": "user", "comment": "hello"}
      {"username": "author", "comment": "hi"}
    ]
  },
  {
    "_id": "ObjectId('6591a724a5af322fc51330ad')",
    "createdAt": "Sun, 31 Dec 2023 17:38:44 GMT",
    "title": "Another blog",
    "body": "Hello this is my new blog\n",
    "author": "author",
    "id": 4,
    "commtents": [
      {"username": "user", "comment": "hello"}
    ]
  }
]
```

## Start MariaDB Container
To start a mariaDB container just run:
```bash
docker run -p 127.0.0.1:${inport}:3306  --name mariadbserver -e MARIADB_ROOT_PASSWORD=${passord} -d mariadb:latest
```
Run the python scripts _create\_db_ and optionally _create\_default\_users.py_ to create the initial databases.
To connect to the container just use:
```bash
mariadb  -h 127.0.0.1 --port 33060 -u root -p
```
And enter the password


## httpd
In Apache add this config
#### Backend Server
Create an environment for the SQL Datbases like this. In _webapp/server_ (local development) or in _/var/www/private/nodejs/userdata/_
(production). In _webapp/server_ just combine: # must match _.env.mongo.internals_ and _.env.sql.internals_ from _/var/www/private/nodejs/userdata/_
 
```.env
# MariaDB config
##.env.sql.internals
### Credentials
MARIADB_USER=''
MARIADB_USER_PASSWORD=''
### STRUCTURE
MARIADB_DATABASE='user_db'
MARIADB_USER_TABLE='users'
MARIADB_COOKIE_TABLE='cookie_table'
MARIADB_RESET_TABLE='reset_table'


# MongoDB config
# .env.mongo.internals
## credentials
MONGO_USER=''
MONGO_USER_PASSWORD=''
## TABLES
MONGO_DB_NAME='blogs'
MONGO_COLLECTION_NAME='entries'
```


### Setup

In this setup there is an apache for the react frontend it forwards the traffic to an internal backendserver (http) the connection to the apache can be HTTPS encrypted from internet to frontendserver but the connection from frontend-server to backend Node.js server (within LAN) is unencrypted and plain

```httpd
<VirtualHost *:80>
    DocumentRoot "/usr/local/apache2/htdocs"
    
    <Directory "/usr/local/apache2/htdocs">
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        <IfModule mod_rewrite.c>
            RewriteEngine On
            # Redirect all requests not matching a file or directory to index.html
            RewriteCond %{REQUEST_FILENAME} !-f
            RewriteCond %{REQUEST_FILENAME} !-d
            RewriteRule ^ index.html [L]
        </IfModule>
    </Directory>

    <Location /api>
      ProxyPass "http://backendserver:8080"
      ProxyPassReverse "http://backendserver:8080"
    </Location>

    ErrorLog "/var/log/httpd/react/error_log"
    CustomLog "/var/log/httpd/react/access_log" common
</VirtualHost>
```
Running the apache in a docker container, when receiving an _/api_ request, forwarding the service backendserver to port 8080 and return the result. 

## Run Application

To run the application first build the client front end. In _client/_
```bash
npm run build
```
Then build the httpd Dockerimage.
```bash
docker build -f docker/httpd_server_file -t httpd_server .
```
At last just excute the docker-compose file
```bash
docker-compose -f docker-compose.yml up --build
```
Once the services are running just run the script to initialize the databases
```
./init_db.sh
```
You could mount MariaDB and MongoDB to a persistent storage otherwise it will be ephermal/volantile storage that 
is deleted once the container is deleted

TODO:
Register token similar to forgot password token send over email in a seperate table.
In the Apache config it would make sense to not allow every access to the api, but to whitelist every specific
API endpoint. It could be that there are endpoints that shouldn't be reachable from an enduser but only for
an admin. For example there could be a ``` /api/update-database``` endpoint that an enduser shouldn't be able
to access, but only the server admin/ person with direct access to the server. For that I could overwrite the 
Apache settings. Instead of allowing every request to ```/api``` limit it.
```httpd
# Proxy specific public endpoints
<Location /api/publicendpoint1>
    ProxyPass "http://backendserver:8080/api/publicendpoint1"
    ProxyPassReverse "http://backendserver:8080/api/publicendpoint1"
</Location>

<Location /api/publicendpoint2>
    ProxyPass "http://backendserver:8080/api/publicendpoint2"
    ProxyPassReverse "http://backendserver:8080/api/publicendpoint2"
</Location>
```
#### Install dev
yarn install client and server. then run docker-compose up -f docker-compose.dev.yml. Then run python3 mongo_init.py and python3 sql_init.py. 
Then run yarn start client and yarn start server.


### Run

```bash 
cd webapp/client
yarn install
yarn build
sudo docker-compose -f docker-compose.yml up --build
./init_databases.sh
```

### Debugging 
```bash
mongosh "mongodb://blog_agent:securepassword_mongodb111@127.0.0.1:27017"
```
