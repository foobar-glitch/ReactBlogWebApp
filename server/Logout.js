const { authenticate } = require('./Authenticate');
const { connectToDatabase, performQuery } = require('./DatabaseConnector');

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
            "DELETE FROM `cookie_data` WHERE `sessionId` = ?",
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