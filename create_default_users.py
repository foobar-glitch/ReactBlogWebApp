import mariadb
from dotenv import load_dotenv
import os

load_dotenv("/var/www/private/nodejs/.env.sql.config")
load_dotenv("/var/www/private/nodejs/.env.sql.internals")

SQL_HOST = os.getenv('MARIADB_HOST')
SQL_PORT = int(os.getenv('MARIADB_PORT'))
USER_NAME = os.getenv('MARIADB_USER')
USER_PASSWORD = os.getenv('MARIADB_USER_PASSWORD')
DB_NAME = os.getenv('MARIADB_DATABASE')
USERS_TABLE = os.getenv('MARIADB_USER_TABLE')

user_connection = mariadb.connect(
    host=SQL_HOST,
    user=USER_NAME,
    port=SQL_PORT,
    password=USER_PASSWORD,
    database=DB_NAME
)


cursor = user_connection.cursor()

create_admin = f"""
INSERT INTO {USERS_TABLE} (userID, username, email, password, salt, role, created_at, updated_at) 
VALUES (1, 'admin', 'admin@mail.com', SHA2(CONCAT('admin','eabb53460fa953b6'), 256), 'eabb53460fa953b6', 'admin', NOW(), NOW());
"""

create_author = """
    INSERT INTO {USERS_TABLE} (userID, username, email, password, salt, role, created_at, updated_at) 
    VALUES (2, 'author', 'author@mail.com', SHA2(CONCAT('author','6f7f4b9659cbfbe6'), 256), '6f7f4b9659cbfbe6', 'author', NOW(), NOW());
"""

create_user = """
    INSERT INTO {USERS_TABLE} (userID, username, email, password, salt, role, created_at, updated_at) 
    VALUES  (3, 'user', 'user@mail.com', SHA2(CONCAT('user','391feef6e93e0b29'), 256), '391feef6e93e0b29', 'user', NOW(), NOW());
"""

cursor.execute(create_admin)
cursor.execute(create_author)
cursor.execute(create_user)

user_connection.commit()
user_connection.close()