# The Blog React App

This is a simple react blog with login feature and adding and deleting blog entries

## Infomation Schemas

There are two SQL databases and one NOSQL database. The SQL databases are for login and session handling and the NOSQL database is for comment storage

### SQL Databases
This is the information Schema for the users (table name: 'users'):
```SQL
CREATE TABLE users (
    userId INT(11) NOT NULL AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
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

## Reset Table

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
