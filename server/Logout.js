const { authenticate } = require('./Authenticate');
const { connectToDatabase, performQuery } = require('./DatabaseConnector');
const {cookie_table_name} = require('/var/www/private/nodejs/mysqlCredentials')

// Function to login. Set a session in the database
async function deleteSessionFromTable(session) {
    let conn;
    try {
        conn = await connectToDatabase();
        auth_successful = await authenticate(session);

        // invalid cookie
        if(!auth_successful){
            return 0
        }

        await performQuery(
            conn,
            `DELETE FROM ${cookie_table_name} WHERE cookieData = ?`,
            [session.id]
        );
        return 1;

    } finally {
      if (conn) {
        conn.end();
      }
    }
  }


module.exports = {
    deleteSessionFromTable
}