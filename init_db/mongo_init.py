import os
from dotenv import load_dotenv
from library.mongo import init_mongo_db, create_blog_entries

def give_mongo_env():
    load_dotenv("../.env")
    load_dotenv("/var/www/private/nodejs/rootdata/.env.mongo.internals")
    load_dotenv("/var/www/private/nodejs/userdata/.env.mongo.internals")
    MONGO_HOST = "127.0.0.1"
    MONGO_PORT = 27017 #os.getenv('MONGO_PORT')

    DB_NAME = os.getenv('MONGO_DB_NAME')
    COLLECTION = os.getenv('MONGO_COLLECTION_NAME')

    ROOT_PASSWORD = os.getenv('MONGO_ROOT_PASSWORD')
    USER = os.getenv('MONGO_USER')
    USER_PASSWORD = os.getenv('MONGO_USER_PASSWORD')

    return (MONGO_HOST, MONGO_PORT, DB_NAME, COLLECTION, ROOT_PASSWORD, USER, USER_PASSWORD)


if __name__=="__main__":
    (MONGO_HOST, MONGO_PORT, DB_NAME, COLLECTION, ROOT_PASSWORD, USER, USER_PASSWORD) = give_mongo_env()
    print("Initializing MongoDB...")
    init_mongo_db(MONGO_HOST, MONGO_PORT, DB_NAME, ROOT_PASSWORD, USER, USER_PASSWORD)
    print("Creating default entries...")
    create_blog_entries(MONGO_HOST, MONGO_PORT, DB_NAME, COLLECTION, USER, USER_PASSWORD)
    print("Mongo succesfully created.")
