from pymongo import MongoClient
from pymongo.database import Database
from datetime import datetime
from bson.objectid import ObjectId

def init_mongo_db(MONGO_HOST, MONGO_PORT, DB_NAME, ROOT_PASSWORD, USER, USER_PASSWORD):
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


def create_blog_entries(MONGO_HOST, MONGO_PORT, DB_NAME, COLLECTION, USER, USER_PASSWORD):
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
        'id': 1,
        'comments': [
           {
           'commentId': 1,
           'userId': 3, 
           'username': 'user', 
           'comment': 'Great Website' 
           }
        ]
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
        'id': 2,
        'comments': [
           {
           'commentId': 1,
           'userId': 3, 
           'username': 'user', 
           'comment': 'Nice Post' 
           }
        ]
    }

    result = collection.insert_one(admin_post)
    result = collection.insert_one(author_post)
    user_connection.close()