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


"""
db.createUser(
  {
    user: "myUserAdmin",
    pwd: "abc123",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" }, 
             { role: "dbAdminAnyDatabase", db: "admin" }, 
             { role: "readWriteAnyDatabase", db: "admin" } ]
  }
)
"""
root_connection = MongoClient(f'mongodb://{MONGO_HOST}:{MONGO_PORT}/')

db = root_connection.admin
db.command("updateUser", "admin",pwd=ROOT_PASSWORD)
db.command("createUser", USER, pwd=USER_PASSWORD)
root_connection.close()

user_connection = MongoClient(f"mongodb://{USER}:{USER_PASSWORD}@{MONGO_HOST}")

#db.entries.find()
#uri = f"mongodb://{username}:{password}@{host}:{port}/"
#username = "newuser"
#password = "newpassword"
#roles = ["readWrite"]  # Roles assigned to the user
