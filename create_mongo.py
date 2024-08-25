from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv(".env")
load_dotenv("/var/www/private/nodejs/rootdata/.env.mongo.internals")
load_dotenv("/var/www/private/nodejs/userdata/.env.mongo.internals")

MONGO_HOST = "127.0.0.1"
MONGO_PORT = os.getenv('MONGODB_PORT')

DB_NAME = os.getenv('MONGO_DB_NAME')
COLLECTION = os.getenv('MONGO_COLLECTION_NAME')

ROOT_PASSWORD = os.getenv('MONGO_ROOT_PASSWORD')
USER = os.getenv('MONGO_USER')
USER_PASSWORD = os.getenv('MONGO_USER_PASSWORD')

root_connection = MongoClient(f'mongodb://{MONGO_HOST}:{MONGO_PORT}/')

root_db = root_connection.admin
root_db.command('createUser', 'root', pwd=ROOT_PASSWORD, roles=["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"])
root_db.command("updateUser", "root", pwd=ROOT_PASSWORD)
root_db.command(
    "createUser", USER, pwd=USER_PASSWORD, 
    roles=[
        { "role":"readWrite","db":f"{DB_NAME}"}
      ]
    )
# Switch to user
root_connection.close()
