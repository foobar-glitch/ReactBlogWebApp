import mariadb
import sys
sys.path.append('/')
from var.www.private.python.mysqlcredentials import SQL_HOST, SQL_PORT, ROOT_USER_NAME, ROOT_USER_PASSWORD, DB_NAME, USER_NAME, USER_PASSWORD


root_connection = mariadb.connect(
    host=SQL_HOST,
    user=ROOT_USER_NAME,
    port=SQL_PORT,
    passwd=ROOT_USER_PASSWORD,
)

cursor = root_connection.cursor()
cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
cursor.execute(f"CREATE USER IF NOT EXISTS `{USER_NAME}`@`%` IDENTIFIED BY '{USER_PASSWORD}'")
cursor.execute(f"GRANT ALL privileges ON `{DB_NAME}`.* TO `{USER_NAME}`@`%`")

root_connection.close()

# Connect to database as non root to avoid mitigate damage to db
user_connection = mariadb.connect(
    host=SQL_HOST,
    user=USER_NAME,
    port=SQL_PORT,
    password=USER_PASSWORD,
    database=DB_NAME
)

cursor = user_connection.cursor()
create_user_table = """
CREATE TABLE IF NOT EXISTS users (
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
"""

create_cookie_table = """
CREATE TABLE IF NOT EXISTS cookie_table (
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
CREATE TABLE IF NOT EXISTS reset_table (
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

user_connection.commit()
user_connection.close()
