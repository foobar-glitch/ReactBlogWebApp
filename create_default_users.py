import mariadb
import sys
sys.path.append('/')
from var.www.private.python.mysqlcredentials import SQL_HOST, SQL_PORT, DB_NAME, USER_NAME, USER_PASSWORD


user_connection = mariadb.connect(
    host=SQL_HOST,
    user=USER_NAME,
    port=SQL_PORT,
    password=USER_PASSWORD,
    database=DB_NAME
)


cursor = user_connection.cursor()

create_admin = """
INSERT INTO users (userID, username, email, password, salt, role, created_at, updated_at) 
VALUES (1, 'admin', 'admin@mail.com', SHA2(CONCAT('admin','eabb53460fa953b6'), 256), 'eabb53460fa953b6', 'admin', NOW(), NOW());
"""

create_author = """
    INSERT INTO users (userID, username, email, password, salt, role, created_at, updated_at) 
    VALUES (2, 'author', 'author@mail.com', SHA2(CONCAT('author','6f7f4b9659cbfbe6'), 256), '6f7f4b9659cbfbe6', 'author', NOW(), NOW());
"""

create_user = """
    INSERT INTO users (userID, username, email, password, salt, role, created_at, updated_at) 
    VALUES  (3, 'user', 'user@mail.com', SHA2(CONCAT('user','391feef6e93e0b29'), 256), '391feef6e93e0b29', 'user', NOW(), NOW());
"""

cursor.execute(create_admin)
cursor.execute(create_author)
cursor.execute(create_user)

user_connection.commit()
user_connection.close()