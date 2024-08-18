# The Blog React App

This is a simple react blog with login feature and adding and deleting blog entries

## Infomation Schemas

There are two SQL databases and one NOSQL database. The SQL databases are for login and session handling and the NOSQL database is for comment storage

### SQL Databases
This is the information Schema for the users (table name: 'users'):
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
| Field      | Type         | Null | Key | Default | Extra |
|------------|--------------|------|-----|---------|-------|
| sessionId  | varchar(255) | NO   |     | NULL    |       |
| userId     | int(11)      | NO   | MUL | NULL    |       |
| createdAt  | datetime     | NO   |     | NULL    |       |
| expiresAt  | datetime     | NO   |     | NULL    |       |

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
    "id": 3
  },
  {
    "_id": "ObjectId('6591a724a5af322fc51330ad')",
    "createdAt": "Sun, 31 Dec 2023 17:38:44 GMT",
    "title": "Another blog",
    "body": "Hello this is my new blog\n",
    "author": "author",
    "id": 4
  }
]
```
