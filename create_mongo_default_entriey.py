from pymongo import MongoClient
from pymongo.database import Database
from datetime import datetime
from bson.objectid import ObjectId
from dotenv import load_dotenv
import os

load_dotenv(".env")
load_dotenv("/var/www/private/nodejs/rootdata/.env.mongo.internals")
load_dotenv("/var/www/private/nodejs/userdata/.env.mongo.internals")

MONGO_HOST = "127.0.0.1"
MONGO_PORT = os.getenv('MONGODB_PORT')

DB_NAME = os.getenv('MONGO_DB_NAME')
COLLECTION = os.getenv('MONGO_COLLECTION_NAME')

USER = os.getenv('MONGO_USER')
USER_PASSWORD = os.getenv('MONGO_USER_PASSWORD')

user_connection = MongoClient(f'mongodb://{USER}:{USER_PASSWORD}@{MONGO_HOST}:{MONGO_PORT}/')
db: Database = getattr(user_connection, f'{DB_NAME}')
collection = db[COLLECTION]

last_entry = collection.find_one(sort=[('_id', -1)])


# Determine the last entry's ID
last_entry_id = last_entry['id'] if last_entry else 0
# Data for the new blog entry
adming_title = "Announcement of Admin"  # Replace with actual title value
admin_body = "Welcome to this website"  # Replace with actual body value
admin_username = "admin"  # Replace with actual author value


current_time = datetime.now()
admin_post = {
    '_id': ObjectId(),
    'createdAt': current_time.strftime('%Y-%m-%dT%H:%M:%SZ'),  # Format as UTC string
    'title': adming_title,
    'body': admin_body,
    'author': admin_username,
    'id': last_entry_id + 1,
    'comments': [ { 'username': 'user', 'comment': 'Great Website.' }]
}

# Data for the new blog entry
author_tile = "The Authors Post"  # Replace with actual title value
author_body = "This is a first post from the author"  # Replace with actual body value
auhor_username = "author"  # Replace with actual author value

current_time = datetime.now()
author_post = {
    '_id': ObjectId(),
    'createdAt': current_time.strftime('%Y-%m-%dT%H:%M:%SZ'),  # Format as UTC string
    'title': author_tile,
    'body': author_body,
    'author': auhor_username,
    'id': last_entry_id + 1,
    'comments': [ { 'username': 'user', 'comment': 'Nice Post' }]
}

result = collection.insert_one(admin_post)
result = collection.insert_one(author_post)
user_connection.close()