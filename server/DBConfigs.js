const dotenv = require('dotenv')
const secrets_path = "/var/www/private/nodejs"
dotenv.config({ path: `${secrets_path}/.env.sql.internals`, encoding: 'utf-8'});
dotenv.config({ path: `${secrets_path}/.env.mongo.internals`, encoding: 'utf-8'});


const SQLSecrets = {
    HOST: process.env.MARIADB_HOST,
    PORT: process.env.MARIADB_PORT,
    USER: process.env.MARIADB_USER,
    USER_PASSWORD: process.env.MARIADB_USER_PASSWORD,
    DB_NAME: process.env.MARIADB_DATABASE,
};

const SQLTableNames = {
    USERS: process.env.MARIADB_USER_TABLE,
    COOKIE: process.env.MARIADB_COOKIE_TABLE,
    RESET: process.env.MARIADB_RESET_TABLE
};

const MongoSecrets = {
    HOST: process.env.MONGO_HOST,
    PORT: process.env.MONGO_PORT,
    USER: process.env.MONGO_USER,
    USER_PASSWORD: process.env.MONGO_USER_PASSWORD,
    DB_NAME: process.env.MONGO_DB_NAME,
};

const MongoCollections = {
    BLOG_ENTRIES: process.env.MONGO_COLLECTION_NAME
}

module.exports = {
    SQLSecrets,
    SQLTableNames,
    MongoSecrets,
    MongoCollections
}



