from dotenv import load_dotenv
import os
from library.mariadb import init_db, create_users

def give_mysql_env():
    load_dotenv("/var/www/private/nodejs/blog/rootdata/.env.sql.internals")
    load_dotenv("/var/www/private/nodejs/blog/userdata/.env.sql.internals")

    SQL_HOST = "127.0.0.1"
    SQL_PORT = 3306#int(os.getenv('MARIADB_PORT'))
    ROOT_USER_PASSWORD = os.getenv('MARIADB_ROOT_PASSWORD')

    USER_NAME = os.getenv('MARIADB_USER')
    USER_PASSWORD = os.getenv('MARIADB_USER_PASSWORD')

    DB_NAME = os.getenv('MARIADB_DATABASE')
    USERS_TABLE = os.getenv('MARIADB_USER_TABLE')
    COOKIE_TABLE = os.getenv('MARIADB_COOKIE_TABLE')
    RESET_TABLE = os.getenv('MARIADB_RESET_TABLE')
    REGISTER_TABLE = os.getenv('MARIADB_REGISTER_TABLE')
    return (SQL_HOST, SQL_PORT, ROOT_USER_PASSWORD, USER_NAME, USER_PASSWORD, DB_NAME, USERS_TABLE, COOKIE_TABLE, RESET_TABLE, REGISTER_TABLE)

if __name__=="__main__":
    (SQL_HOST, SQL_PORT, ROOT_USER_PASSWORD, USER_NAME, USER_PASSWORD, DB_NAME, USERS_TABLE, COOKIE_TABLE, RESET_TABLE, REGISTER_TABLE) = give_mysql_env()
    print("Initializing Databases...")
    init_db(SQL_HOST, SQL_PORT, ROOT_USER_PASSWORD, USER_NAME, USER_PASSWORD, DB_NAME, USERS_TABLE, COOKIE_TABLE, RESET_TABLE, REGISTER_TABLE)

    print("Creating login data default Entries...")
    create_users(SQL_HOST, SQL_PORT, USER_NAME, USER_PASSWORD, DB_NAME, USERS_TABLE)
    print("MariaDB succesfully created.")

