import mariadb
from dotenv import load_dotenv
import os

#load_dotenv("/var/www/private/nodejs/.env.sql.config")
load_dotenv(".env")
load_dotenv("/var/www/private/nodejs/.env.sql.internals")

SQL_HOST = os.getenv('MARIADB_HOST')
SQL_PORT = int(os.getenv('MARIADB_PORT'))
ROOT_USER_NAME = os.getenv('MARIADB_ROOT_USERNAME')
ROOT_USER_PASSWORD = os.getenv('MARIADB_ROOT_PASSWORD')

USER_NAME = os.getenv('MARIADB_USER')
USER_PASSWORD = os.getenv('MARIADB_USER_PASSWORD')

DB_NAME = os.getenv('MARIADB_DATABASE')
USERS_TABLE = os.getenv('MARIADB_USER_TABLE')
COOKIE_TABLE = os.getenv('MARIADB_COOKIE_TABLE')
RESET_TABLE = os.getenv('MARIADB_RESET_TABLE')


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
create_user_table = f"""
CREATE TABLE IF NOT EXISTS {USERS_TABLE} (
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

create_cookie_table = f"""
CREATE TABLE IF NOT EXISTS {COOKIE_TABLE} (
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

create_reset_table = f"""
CREATE TABLE IF NOT EXISTS {RESET_TABLE} (
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
