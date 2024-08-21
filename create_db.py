import mysql.connector
from mysql.connector import Error

mysql_host = "localhost"
root = "root"
root_password = "root"
database_name = "web_db"

user = "web_user"
user_password = "user_secret"

root_connection = mysql.connector.connect(
    host=mysql_host,
    user=root,
    password=root_password,
)

cursor = root_connection.cursor()
cursor.execute(f"CREATE DATABASE IF NOT EXISTS {database_name}")
cursor.execute(f"CREATE USER IF NOT EXISTS {user}@{mysql_host} IDENTIFIED BY '{user_password}'")
cursor.execute(f"GRANT ALL privileges ON `{database_name}`.* TO `{user}`@`{mysql_host}`")

root_connection.close()

# Connect to database as non root to avoid mitigate damage to db
user_connection = mysql.connector.connect(
    host=mysql_host,
    user=user,
    password=user_password,
    database=database_name
)

cursor = user_connection.cursor()
create_user_table = """
CREATE TABLE users (
    userId INT(11) NOT NULL AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (userId)
);
"""

create_cookie_table = """
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
"""

create_reset_table = """
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
"""
cursor.execute(create_user_table)
cursor.execute(create_cookie_table)
cursor.execute(create_reset_table)

drop_tables = "DROP TABLE users;"
